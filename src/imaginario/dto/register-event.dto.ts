import { IsNotEmpty } from 'class-validator';

export class RegisterEventDto {
  @IsNotEmpty({ message: 'La palabra clave es obligatoria' })
  keyword: string;
}
