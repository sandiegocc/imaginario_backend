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

interface MongoError {
  code: number;
}

export interface RankingEntry {
  child: string;
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
  ) {}

  async create(createDto: CreateImaginarioDto): Promise<LoginResponse> {
    try {
      const newUser = new this.imaginarioModel(createDto);
      const savedUser = await newUser.save();

      const payload = {
        sub: savedUser._id,
        user: savedUser,
      };

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

  async registerEventByKeyword(userId: string, keyword: string) {
    const events = [
      'sandiego',
      'imaginario',
      'tradicion',
      'medellin',
      'encuentro',
      'fantasía',
      'magia',
      'alegria',
      'creatividad',
      'color',
      'inspiracion',
      'arte',
      'ilusion',
      'explorador',
      'aventura',
      'mision',
      'descubrimiento',
      'desafio',
      'viaje',
      'curiosidad',
      'diversion',
      'juegos',
      'familia',
      'juego',
      'sonrisas',
      'compartir',
      'robot',
      'taller',
      'estacion',
      'codigo',
      'escaneo',
      'puntos',
    ];

    if (!events.includes(keyword)) {
      throw new NotFoundException('La palabra clave no fué encontrada');
    }

    const updatedUser = await this.imaginarioModel
      .findByIdAndUpdate(
        userId,
        { $addToSet: { events: keyword } },
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
        { $project: { child: 1, points: 1 } },
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
        { $project: { child: 1, points: 1 } },
      ])
      .exec()) as RankingEntry[];

    return [
      ...above.reverse(),
      {
        child: currentUser.child,
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
