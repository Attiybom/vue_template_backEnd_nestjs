import {
  IsArray,
  IsNotEmpty,
  IsString,
  Length,
  ValidateNested,
} from 'class-validator';
import { Roles } from 'src/roles/roles.entity';
import { ProfileDto } from './profile.dto';
import { Type } from 'class-transformer';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  @Length(6, 20)
  username: string;

  @IsString()
  @IsNotEmpty()
  @Length(6, 32)
  password: string;

  @IsArray()
  roles?: Roles[] | number[];

  @ValidateNested()
  @Type(() => ProfileDto)
  profile?: ProfileDto;
}
