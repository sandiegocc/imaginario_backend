import { Module } from '@nestjs/common';
import { ImaginarioService } from './services/imaginario.service';
import { ImaginarioController } from './controllers/imaginario.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Imaginario, ImaginarioSchema } from './schemas/imaginario.schema';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Imaginario.name, schema: ImaginarioSchema },
    ]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('SECRET_KEY'),
        signOptions: { expiresIn: '365d' },
      }),
    }),
  ],
  controllers: [ImaginarioController],
  providers: [ImaginarioService],
})
export class ImaginarioModule {}
