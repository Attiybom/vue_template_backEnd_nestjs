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
  // return this.userRepository.find({
  // ...,
  //   relations: ['profile', 'roles'],
  //   ...
  // });
  // 方式2
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
}

```
