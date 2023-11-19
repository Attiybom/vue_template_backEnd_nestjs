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

## 更新数据
```ts
  // controller.ts
  @Patch('/:id')
  updateUser(@Body() dto: any, @Param('id') id: number): any {
    // 步骤有三
    // 1.判断操作是否为用户本人操作
    // 2.判断用户是否有更新user的权限
    // 返回数据中不能包含敏感信息(password等)
    const user = dto as User;
    return this.userService.update(id, user);
  }

  // service.ts
    async update(id: number, user: Partial<User>) {
    // 联合模型更新, 需要使用save方法或queryBuilder
    // 1.先找到对应的实体
    const userTemp = await this.findProfile(id);
    // 2.将实体和前端传递过来的数据进行合并
    const newUser = this.userRepository.merge(userTemp, user);

    return this.userRepository.save(newUser);

    // 单模型，不适合有关系的模型更新
    // return this.userRepository.update(newUser);
  }

  // entity.ts
  // 对应的关联映射要开启cascade: true, 才能实现级联更新
  @OneToOne(() => Profile, (profile) => profile.user, { cascade: true })
  profile: Profile;

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


### 其他相关
* controller名 && service名 && repository名 取法
![Alt text](image.png)
```ts
// xxx.controller.ts
  @Delete('/:id') // Delete这里指的是restful API中的四种方法（get/post/patch/delete）之一
  deleteUser(@Param('id') id: number): any {
    console.log('deleteUser-id', id);
    // todo 传递参数id
    return this.userService.remove(id);
  }
```
  - controller名 尽量语义化, 如getAllUsers/getUserById/createUser/updateUser/deleteUser
  - service 层保持与repositories


* typeorm 里面的 delete 与 remove 的区别
 - ![Alt text](image-2.png)

* service（服务）与 repositories（存储库）的区别
 - ![Alt text](image-1.png)


## 安全相关

### 守卫与拦截器
![Alt text](image-3.png)
#### 序列化
* 过滤敏感数据
```ts
// user.entity.ts
import { Exclude } from 'class-transformer';
@Entity()
export class User {
  @Column()
  // 使用
  @Exclude()
  password: string;
}

// auth.controller.ts
import { SerializeInterceptor } from 'src/interceptors/serialize/serialize.interceptor';

@Controller('auth')
@UseInterceptors(ClassSerializerInterceptor)
@UseFilters(new TypeormFilter())

```


### pipe 与 Serialization
![Alt text](image-4.png)


#### pipe
```ts
// main.ts
async function bootstrap() {
  // 引入全局的拦截器
  app.useGlobalPipes(
    new ValidationPipe({
      // 去除在类上不存在的字段，提高安全性如防止sql注入等
      whitelist: true,
    }),
  );
}
bootstrap();

```

### bug - jwt
* token不一样却能请求到对方的数据

eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImFyZ29uMlRlc3QzIiwic3ViIjozMiwiaWF0IjoxNzAwMzkxODEzLCJleHAiOjE3MDA5OTY2MTN9.-MXN6I0qqhmXQNU0uCR2J0auDiG4zOJi84qSJYK01Jk
