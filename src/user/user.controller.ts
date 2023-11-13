import {
  Controller,
  Delete,
  Get,
  Patch,
  Post,
  Inject,
  LoggerService,
  Body,
  Param,
  Req,
  Query,
  UseFilters,
  Headers,
  HttpException,
  UnauthorizedException,
} from '@nestjs/common';
import { UserService } from './user.service';
import { ConfigService } from '@nestjs/config';
import { User } from './user.entity';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';

import { getUserDto } from './dto/get-user.dto';
import { TypeormFilter } from 'src/filters/typeorm.filter';
@Controller('user')
@UseFilters(new TypeormFilter())
export class UserController {
  // private logger = new Logger(UserController.name);

  constructor(
    private userService: UserService,
    private configService: ConfigService,
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private readonly logger: LoggerService,
  ) {
    this.logger.log('UserController init');
  }

  @Get()
  getUsers(@Query() query: getUserDto): any {
    // console.log('getUsers-query', query);
    console.log('sss');
    // page-页码
    // limit-每页条数
    // condition-查询条件

    // this.logger.log(`请求getUsers成功`);
    // this.logger.warn(`请求getUsers成功`);
    // this.logger.error(`请求getUsers成功`);
    return this.userService.findAll(query);
    // return this.userService.getUsers();
  }

  @Post()
  addUser(@Body() dto: any): any {
    // 通过@Body() 把前端发送过来的数据解析到dto上
    const user = dto as User;
    // return this.userService.addUser();
    return this.userService.create(user);
  }

  @Get('/profile')
  getUserProfile(@Query() query: any): any {
    console.log('getUserProfile-query', query);
    return this.userService.findProfile(2);
  }

  @Get('/:id')
  getUser(@Param('id') id: number): any {
    console.log('getUser-id', id);
    return '查询单个用户';
    // return this.userService.getUsers();
  }

  @Patch('/:id')
  async updateUser(
    @Body() dto: any,
    @Param('id') id: number,
    @Headers('Authorization') headers: any,
  ): Promise<any> {
    // 步骤有三
    // 1.判断操作是否为用户本人操作
    // 2.判断用户是否有更新user的权限
    // 返回数据中不能包含敏感信息(password等)

    console.log('updateUser-dto', dto);
    console.log('updateUser-id', id);
    console.log('updateUser-headers', headers);

    // 步骤1（临时方案）
    if (id === headers) {
      // 是同一用户

      const user = dto as User;
      return this.userService.update(id, user);
    } else {
      throw new UnauthorizedException(); //403,没有权限，该方法已经集成好了
    }
  }

  @Delete('/:id')
  deleteUser(@Param('id') id: number): any {
    console.log('deleteUser-id', id);
    // todo 传递参数id
    return this.userService.remove(id);
  }

  // 后期挪到log模块去
  @Get('/logs')
  getUserLogs(): any {
    return this.userService.findUserLogs(2);
  }

  @Get('/logsByGroup')
  async getLogsByGroup(): Promise<any> {
    const res = await this.userService.findLogsByGroup(2);
    // return res.map((o) => ({
    //   result: o.result,
    //   count: o.count,
    // }));
    return res;
  }
}
