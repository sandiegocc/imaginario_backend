import { IsNotEmpty } from 'class-validator';

export class RegisterEventDto {
  @IsNotEmpty({ message: 'El evento es obligatorio' })
  event: string;

  @IsNotEmpty({ message: 'La palabra clave es obligatoria' })
  keyword: string;
}
