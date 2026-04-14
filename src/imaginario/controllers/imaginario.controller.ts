import {
  Body,
  Controller,
  Get,
  Patch,
  Post,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ImaginarioService } from '../services/imaginario.service';
import { CreateImaginarioDto } from '../dto/create-imaginario.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RegisterEventDto } from '../dto/register-event.dto';
import { GetUser } from '../../auth/decorators/get-user.decorator';

@Controller('imaginario')
export class ImaginarioController {
  constructor(private readonly imaginarioService: ImaginarioService) {}

  @Post()
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  async create(@Body() createImaginarioDto: CreateImaginarioDto) {
    return await this.imaginarioService.create(createImaginarioDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('ranking')
  async getMyRanking(@GetUser('userId') userId: string) {
    return this.imaginarioService.getRelativeRanking(userId);
  }

  @UseGuards(JwtAuthGuard)
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  @Patch('register-event')
  async registerEvent(
    @GetUser('userId') userId: string,
    @Body() payload: RegisterEventDto,
  ) {
    return {
      events: await this.imaginarioService.registerEventByKeyword(
        userId,
        payload.event,
        payload.keyword,
      ),
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get('user')
  async getUserInfo(@GetUser('userId') userId: string) {
    return {
      user: await this.imaginarioService.getUserInfo(userId),
    };
  }
}
