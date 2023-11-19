import {
  ForbiddenException,
  HttpException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { getUserDto } from 'src/user/dto/get-user.dto';
import { UserService } from 'src/user/user.service';
import * as argon2 from 'argon2';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  async signin(username: string, password: string) {
    const user = await this.userService.find(username);
    if (!user) {
      throw new ForbiddenException('用户不存在，请先注册！');
    }

    // 使用argon2对用户密码比对
    const isPasswordValid = await argon2.verify(user.password, password);
    if (!isPasswordValid) {
      throw new ForbiddenException('用户名或密码错误！');
    }

    return await this.jwtService.signAsync({
      username: user.username,
      sub: user.id,
    });

    // if (user && user.password === password) {
    //   // 生成token
    //   return await this.jwtService.signAsync(
    //     {
    //       username: user.username,
    //       sub: user.id,
    //     },
    //     // 局部设置
    //     {
    //       expiresIn: '7d',
    //     },
    //   );
    // }
    // throw new UnauthorizedException();

    // const res = await this.userService.findAll({ username } as getUserDto);

    // return res;
  }
  async signup(username: string, password: string) {
    const user = await this.userService.find(username);
    if (user) {
      throw new ForbiddenException('用户已存在');
    }

    const res = await this.userService.create({
      username,
      password,
    });

    return res;
  }
}
