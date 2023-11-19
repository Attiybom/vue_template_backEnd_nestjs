import { Transform } from 'class-transformer';
import { IsNumber, IsString } from 'class-validator';

export class ProfileDto {
  @IsNumber()
  @Transform(({ value }) => parseInt(value), { toClassOnly: true })
  gender: number;

  @IsString()
  address: string;

  @IsString()
  photo: string;
}
