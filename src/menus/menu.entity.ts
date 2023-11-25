import { Roles } from 'src/roles/roles.entity';
import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class Menu {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  route: string;

  @Column()
  sort: number;

  @Column()
  action: string;

  // 一个角色对应多个menus，对应多个控制权限
  @ManyToMany(() => Roles, (roles) => roles.menus, { cascade: ['insert'] })
  @JoinTable({ name: 'roles_menus' })
  roles: Roles;
}
