import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class CreateImaginarioDto {
  @IsEmail({}, { message: 'El formato del email es inválido' })
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  whatsapp: string;

  @IsString()
  @IsNotEmpty()
  documentId: string;

  @IsString()
  @IsNotEmpty()
  fullName: string;

  @IsString()
  @IsNotEmpty()
  team: string;
}
