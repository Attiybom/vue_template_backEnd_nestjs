import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';
import { User } from 'src/user/user.entity';
import { UserService } from 'src/user/user.service';

@Injectable()
export class AdminGuard implements CanActivate {
  constructor(private userService: UserService) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    //1.获取请求信息
    const req = context.switchToHttp().getRequest();
    // console.log('req.user', req.user);
    //2.对请求信息进行相关逻辑判断
    // const user = (await this.userService.find(req.user.username)) as User;
    // console.log('user', user)

    // if (user.roles.filter((o) => o.id === 3).length > 0) {
    //   return true;
    // }

    console.log('AdminGuard', req);
    return true;
  }
}
