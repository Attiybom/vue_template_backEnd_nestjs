import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common';
import { CreateUserDto } from '../../dto/create-user.dto';

@Injectable()
export class CreateUserPipe implements PipeTransform {
  transform(value: CreateUserDto, metadata: ArgumentMetadata) {
    // console.log('pipe', value);
    if (value.roles && Array.isArray(value.roles) && value.roles.length > 0) {
      if (value.roles[0]['id']) {
        // 如果存在id,说明是Roles[]这种形式
        value.roles = value.roles.map((item) => item.id);
      }
    }

    return value;
  }
}
