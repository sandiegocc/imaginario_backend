import { Module } from '@nestjs/common';
import { ImaginarioService } from './services/imaginario.service';
import { ImaginarioController } from './controllers/imaginario.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Imaginario, ImaginarioSchema } from './schemas/imaginario.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Imaginario.name, schema: ImaginarioSchema },
    ]),
  ],
  controllers: [ImaginarioController],
  providers: [ImaginarioService],
})
export class ImaginarioModule {}
