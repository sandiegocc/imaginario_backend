import {
  Injectable,
  ConflictException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateImaginarioDto } from '../dto/create-imaginario.dto';
import { Imaginario } from '../schemas/imaginario.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import { MailchimpService } from '../../mailchimp/services/mailchimp.service';
import { events } from './events';

interface MongoError {
  code: number;
}

export interface RankingEntry {
  team: string;
  points: number;
  isCurrentUser?: boolean;
}

export interface LoginResponse {
  token: string;
  user: Imaginario;
}

@Injectable()
export class ImaginarioService {
  constructor(
    @InjectModel(Imaginario.name) private imaginarioModel: Model<Imaginario>,
    private readonly jwtService: JwtService,
    private readonly mailchimpService: MailchimpService,
  ) {}

  async create(createDto: CreateImaginarioDto): Promise<LoginResponse> {
    try {
      const newUser = new this.imaginarioModel(createDto);
      const savedUser = await newUser.save();

      const payload = {
        sub: savedUser._id,
        user: savedUser,
      };

      await this.mailchimpService.addSubscriber(
        newUser.email,
        newUser.fullName,
      );

      return {
        token: this.jwtService.sign(payload),
        user: savedUser,
      };
    } catch (error) {
      const mongoError = error as MongoError;
      if (mongoError.code === 11000) {
        throw new ConflictException(
          'El email, WhatsApp o Documento ya están registrados.',
        );
      }
      throw new InternalServerErrorException();
    }
  }

  async registerEventByKeyword(userId: string, event: string, keyword: string) {
    // 1. Limpiamos la palabra: pasamos a minúsculas y eliminamos tildes
    const sanitizedKeyword = keyword
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');

    const locatedEvent = events.find(
      (e) => e.url.toLowerCase() === event.toLowerCase(),
    );

    if (!locatedEvent) {
      throw new NotFoundException('No se encontró el evento');
    }

    // 2. Validamos contra la palabra ya procesada
    if (locatedEvent.keyword !== sanitizedKeyword) {
      throw new NotFoundException(
        'La palabra clave no es la correcta. Intentalo de nuevo',
      );
    }

    // 3. Guardamos la versión "limpia" en la base de datos
    const updatedUser = await this.imaginarioModel
      .findByIdAndUpdate(
        userId,
        { $addToSet: { events: sanitizedKeyword } },
        { returnDocument: 'after' },
      )
      .exec();

    if (!updatedUser) {
      throw new NotFoundException('Usuario no encontrado');
    }

    return updatedUser.events;
  }

  async getRelativeRanking(userId: string): Promise<RankingEntry[]> {
    const currentUser = await this.imaginarioModel.findById(userId).exec();

    if (!currentUser) throw new NotFoundException('Usuario no encontrado');

    const userPoints = currentUser.events?.length || 0;

    const above = (await this.imaginarioModel
      .aggregate([
        {
          $addFields: { points: { $size: { $ifNull: ['$events', []] } } },
        },
        {
          $match: {
            $or: [
              { points: { $gt: userPoints } },
              { points: userPoints, _id: { $lt: currentUser._id } },
            ],
            _id: { $ne: currentUser._id },
          },
        },
        { $sort: { points: 1, _id: -1 } },
        { $limit: 5 },
        { $project: { team: 1, points: 1 } },
      ])
      .exec()) as RankingEntry[];

    const below = (await this.imaginarioModel
      .aggregate([
        {
          $addFields: { points: { $size: { $ifNull: ['$events', []] } } },
        },
        {
          $match: {
            $or: [
              { points: { $lt: userPoints } },
              { points: userPoints, _id: { $gt: currentUser._id } },
            ],
            _id: { $ne: currentUser._id },
          },
        },
        { $sort: { points: -1, _id: 1 } },
        { $limit: 5 },
        { $project: { team: 1, points: 1 } },
      ])
      .exec()) as RankingEntry[];

    return [
      ...above.reverse(),
      {
        team: currentUser.team,
        points: userPoints,
        isCurrentUser: true,
      },
      ...below,
    ];
  }

  getUserInfo(userId: string) {
    return this.imaginarioModel.findOne({ _id: userId }).exec();
  }
}
