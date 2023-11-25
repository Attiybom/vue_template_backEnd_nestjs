import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { ROLES_KEY } from 'src/decorator/roles.decorator';
import { RoleEnum } from 'src/enum/role.enum';
import { UserService } from 'src/user/user.service';

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(private reflector: Reflector, private userService: UserService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // method 1
    // jwt guard 会把user信息放到request中
    // getAllAndOverride()方法会返回一个数组，数组中的每一项都是一个对象，对象的key是我们自定义的装饰器的key，value是我们自定义的装饰器的value
    // getAllAndMerge()方法会返回一个对象，对象的key是我们自定义的装饰器的key，value是我们自定义的装饰器的value
    const requireRoles = this.reflector.getAllAndOverride<RoleEnum[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requireRoles) {
      return true;
    }

    const req = context.switchToHttp().getRequest();
    const userInfo = req.user;
    const user = await this.userService.find(userInfo.username);
    console.log('user', user);
    console.log('requireRoles', requireRoles);

    const roleIds = user.roles.map((role) => role.id);

    // 如果用户的ids包含1，则说明用户是管理员，则直接返回true
    if (roleIds.includes(1)) {
      return true;
    }

    // 判断用户的角色是否有权限
    const hasRole = () =>
      roleIds.some((roleId) => requireRoles.includes(roleId));
    if (!hasRole()) {
      return false;
    }
    return true;
  }
}
