## 参数解析
* body参数
```ts
addUser(@Body() dto: any): any {
  // 通过@Body() 把前端发送过来的数据解析到dto上
  const user = dto as User;
  return this.userService.create(user);
}
```
* query参数
```ts
// user.controller.ts
getUsers(@Query() query: any): any {
  // 通过@Query() 把前端发送过来的数据解析到query上
  // page-页码
  // limit-每页条数
  // condition-查询条件(username) => 具体的查询条件可以去看实体类上面的各个字段，如username,roles,profile,只要是有关联的都可以上，排序也可以
  // 注意前端传过来的数据全都是string

  return this.userService.findAll(query);
}


// user.service.ts
findAll(query: getUserDto) {
  const { limit: take = 10, page = 1 } = query;

  // 方式1
  return this.userRepository.find({
    select: {
      // 筛选字段
      id: true,
      username: true,
      profile: {
        gender: true,
      },
      // roles: {
      //   id: true,
      // },
    },
    relations: {
      // 联合查询
      roles: true,
      profile: true,
    },
    where: {
      // 条件筛选
      username,
      profile: {
        gender,
      },
      roles: {
        id: role, // 重命名
      },
    },
    // 分页
    skip: (page - 1) * take,
    // 一页多少条 - limit
    take,
  });

  // 使用query-builder查询
  // method-two

  const obj = {
    'user.username': username,
    'profile.gender': gender,
    'roles.id': role,
  };

  const queryBuilder = this.userRepository
    .createQueryBuilder('user')
    .leftJoinAndSelect('user.profile', 'profile')
    .leftJoinAndSelect('user.roles', 'roles');

  // conditionUtils是防止null数据，进行对应的替换，具体可看utils中的db.helper.ts文件
  const newBuilder = conditionUtils<User>(queryBuilder, obj);

  return newBuilder
    .take(take)
    .skip((page - 1) * take)
    .getMany();
}

```

## 新建数据
```ts
// user.entity.ts
@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  // 实体类中unique设为true，保证唯一性
  @Column({ unique: true })
  username: string;

  @Column()
  password: string;

  // typescript -> 数据库 关联关系 Mapping
  @OneToMany(() => Logs, (logs) => logs.user)
  logs: Logs[];

  @ManyToMany(() => Roles, (roles) => roles.users)
  @JoinTable({ name: 'users_roles' })
  roles: Roles[];

  @OneToOne(() => Profile, (profile) => profile.user)
  profile: Profile;
}


```

## 引入全局错误返回
```ts


```

### 单独引入错误filter
```ts
// 如果不想要spec文件，则加上 --no-spec
nest g f filers/typeorm --flat
```


## bug相关
```ts
// request-js 依赖问题
deprecated @npmcli/move-file@1.1.2: This functionality has been moved to @npmcli/fs
Already up to date

// 解决方案一：手动更新
pnpm update
// 解决方案二：安装依赖包（本次根据方案二解决）
pnpm install @types/request-ip

```
