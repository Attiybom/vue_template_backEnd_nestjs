import { Roles } from 'src/decorator/roles.decorator';
import { Logs } from 'src/logs/logs.entity';
import { Menu } from 'src/menus/menu.entity';
import { User } from 'src/user/user.entity';

export const getEntities = (path: string) => {
  const map = {
    '/users': User,
    '/logs': Logs,
    '/roles': Roles,
    '/menus': Menu,
    '/auth': 'Auth',
  };

  // 循环
  const keys = Object.keys(map);
  for (let index = 0; index < keys.length; index++) {
    const key = keys[index];
    if (path.startsWith(key)) {
      return map[key];
    }
  }
};
