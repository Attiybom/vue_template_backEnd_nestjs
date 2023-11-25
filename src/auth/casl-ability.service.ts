import { Injectable } from '@nestjs/common';
import { AbilityBuilder, createMongoAbility } from '@casl/ability';
import { Logs } from 'src/logs/logs.entity';
import { UserService } from 'src/user/user.service';
import { getEntities } from 'src/utils/common';

// nestjs 注册实例
@Injectable()
export class CaslAbilityService {
  constructor(private userService: UserService) {}

  async forRoot(username: string) {
    // forRoot => 用于 nestjs 的模块全局注册
    const { can, build, cannot } = new AbilityBuilder(createMongoAbility);

    const user = await this.userService.find(username);

    user.roles.forEach((o) => {
      o.menus.forEach((menu) => {
        // console.log('menu', menu);
        const actions = menu.action.split(',');
        for (let i = 0; i < actions.length; i++) {
          const action = actions[i];
          can(action, getEntities(menu.route));
        }
      });
    });

    console.log('casl-ability-user', user);
    // can('manage', 'all');

    // menu表 含有name\route\sort\action等字段
    // menu表 对应的权限 action
    // 创造映射关系
    // log -> sys:log -> sys:log:read, sys:log:create, sys:log:update, sys:log:delete
    // can('read', Logs);
    // cannot('read', Logs);

    const ability = build({
      detectSubjectType: (object) => object.constructor as any,
    });

    return ability;
  }
}
