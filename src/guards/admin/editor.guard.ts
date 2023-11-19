import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';
import { User } from 'src/user/user.entity';
import { UserService } from 'src/user/user.service';

@Injectable()
export class EditorGuard implements CanActivate {
  constructor(protected userService: UserService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();

    const user = (await this.userService.find(req.user.username)) as User;
    const filterIds = new Set([1, 3]);
    const roleArr = user.roles.filter((o) => filterIds.has(o.id));

    if (roleArr.length > 0) {
      return true;
    } else {
      return false;
    }

    return true;
  }
}
