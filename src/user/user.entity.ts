import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  OneToMany,
  ManyToMany,
  JoinTable,
  OneToOne,
  AfterInsert,
  AfterRemove,
  JoinColumn,
} from 'typeorm';
import { Logs } from '../logs/logs.entity';
import { Roles } from '../roles/roles.entity';
import { Profile } from './profile.entity';
import { Exclude } from 'class-transformer';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  @Exclude()
  id: number;

  @Column({ unique: true })
  username: string;

  @Column()
  @Exclude()
  password: string;

  // typescript -> 数据库 关联关系 Mapping
  @OneToMany(() => Logs, (logs) => logs.user, { cascade: true })
  logs: Logs[];

  //  因为是1对多，这里cascade用数组形式，使用插入
  @ManyToMany(() => Roles, (roles) => roles.users, { cascade: ['insert'] })
  @JoinTable({ name: 'users_roles' })
  roles: Roles[];

  // 因为是1对1，所以cascade可以直接设为true
  @OneToOne(() => Profile, (profile) => profile.user, {
    cascade: true,
  })
  profile: Profile;

  // 钩子方法
  // @AfterInsert()
  // afterInsert() {
  //   console.log('afterInsert', this.id, this.username);
  // }

  // @AfterRemove()
  // afterRemove() {
  //   console.log('afterRemove', this.id);
  // }
}
