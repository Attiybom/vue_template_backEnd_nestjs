import { Column, Entity, ManyToMany, PrimaryGeneratedColumn } from 'typeorm';
import { User } from '../user/user.entity';
import { Menu } from 'src/menus/menu.entity';

@Entity()
export class Roles {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @ManyToMany(() => User, (user) => user.roles)
  users: User[];

  // 一个角色对应多个menus，对应多个控制权限
  @ManyToMany(() => Menu, (menu) => menu.roles, { cascade: ['insert'] })
  menus: Menu[];
}
