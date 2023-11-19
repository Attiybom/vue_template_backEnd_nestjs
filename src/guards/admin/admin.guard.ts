import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { User } from 'src/user/user.entity';
import { UserService } from 'src/user/user.service';

@Injectable()
export class AdminGuard implements CanActivate {
  constructor(private userService: UserService) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    //1.获取请求信息
    const req = context.switchToHttp().getRequest();
    // console.log('AdminGuard-req', req);
    // const { query = {}, user = {} } = req;
    // console.log('AdminGuard-query-user', query, user);
    // if (parseInt(query.id) !== user.userId) { //有局限性
    //   throw new UnauthorizedException();
    // }

    // if (userId !== )
    //2.对请求信息进行相关逻辑判断（这里根据用户角色判断权限）
    const user = (await this.userService.find(req.user.username)) as User;
    const roleArr = user.roles.filter((o) => o.id === 1);

    if (roleArr.length > 0) {
      return true;
    } else {
      return false;
    }

    return true;
  }
}
