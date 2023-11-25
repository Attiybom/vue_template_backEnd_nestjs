import { IsNotEmpty, IsString } from 'class-validator';
export class CreateMenuDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  route: string;

  @IsString()
  @IsNotEmpty()
  sort: number;

  @IsString()
  @IsNotEmpty()
  action: string;
}
