import {
  Body,
  Controller,
  HttpException,
  Post,
  UseFilters,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { TypeormFilter } from 'src/filters/typeorm.filter';

@Controller('auth')
@UseFilters(new TypeormFilter())
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('/signin')
  signIn(@Body() dto: any) {
    const { username, password } = dto;
    return this.authService.signin(username, password);
  }

  @Post('/signup')
  signUp(@Body() dto: any) {
    const { username, password } = dto;

    // 用户名/密码不得为空
    if (!username || !password) {
      throw new HttpException('用户名或密码不得为空', 400);
    }

    // 其余校验规则，使用正则，比如长度、不符合格式等
    if (username.length < 6 || password.length < 6) {
      throw new HttpException('用户名或密码长度不得少于六位', 400);
    }

    return this.authService.signup(username, password);
  }
}
