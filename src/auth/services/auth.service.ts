import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Imaginario } from '../../imaginario/schemas/imaginario.schema';
import { LoginDto } from '../dto/login.dto';

export interface LoginResponse {
  token: string;
  user: Imaginario;
}

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(Imaginario.name) private imaginarioModel: Model<Imaginario>,
    private jwtService: JwtService,
  ) {}

  async login(data: LoginDto): Promise<LoginResponse> {
    const user = await this.imaginarioModel
      .findOne({ whatsapp: data.whatsapp })
      .exec();

    if (!user || user.documentId !== data.documentId) {
      throw new UnauthorizedException('Credenciales incorrectas');
    }

    const payload = {
      sub: user._id,
      user: user,
    };

    return {
      token: this.jwtService.sign(payload),
      user: user,
    };
  }
}
