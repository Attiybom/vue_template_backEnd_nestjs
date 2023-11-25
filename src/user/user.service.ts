import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { User } from './user.entity';
import { Logs } from '../logs/logs.entity';
import { getUserDto } from './dto/get-user.dto';
import { conditionUtils } from 'src/utils/db.helper';
import { Roles } from 'src/roles/roles.entity';
import * as argon2 from 'argon2';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    @InjectRepository(Logs) private readonly logsRepository: Repository<Logs>,
    @InjectRepository(Roles)
    private readonly rolesRepository: Repository<Roles>,
  ) {}

  findAll(query: getUserDto) {
    const { limit: take = 10, page = 1, username, gender, role } = query;
    const skip = (page - 1) * take;
    // console.log('skip', skip, typeof skip);
    // console.log('take', take, typeof take);
    // console.log('page', page, typeof page);

    // method-one
    // return this.userRepository.find({
    //   select: {
    //     // 筛选字段
    //     id: true,
    //     username: true,
    //     profile: {
    //       gender: true,
    //     },
    //     // roles: {
    //     //   id: true,
    //     // },
    //   },
    //   relations: {
    //     // 联合查询
    //     roles: true,
    //     profile: true,
    //   },
    //   where: {
    //     // 条件筛选
    //     username,
    //     profile: {
    //       gender,
    //     },
    //     roles: {
    //       id: role, // 重命名
    //     },
    //   },
    //   // 分页
    //   skip,
    //   // 一页多少条 - limit
    //   take,
    // });

    // method-two

    const obj = {
      // 'user.username': username,//如果名字需要模糊查询则注释掉
      'profile.gender': gender,
      'roles.id': role,
    };

    const queryBuilder = this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.profile', 'profile')
      .leftJoinAndSelect('user.roles', 'roles');

    const newBuilder = conditionUtils<User>(queryBuilder, obj);

    if (username) {
      // 用户名开启模糊查询
      newBuilder.andWhere('user.username LIKE :username', {
        username: `%${username}%`,
      });
    }

    return newBuilder.take(take).skip(skip).getMany();
  }

  find(username: string) {
    return this.userRepository.findOne({
      where: { username },
      relations: ['roles', 'roles.menus'],
    });
  }

  findOne(id: number) {
    return this.userRepository.findOne({ where: { id } });
  }

  async create(user: Partial<User>) {
    // 如果用户没有选择具体id，则默认普通用户
    if (!user.roles) {
      console.log('未传roles');
      user.roles = await this.rolesRepository.find({
        where: {
          id: In([2]), // id为2的是普通用户
        },
      });
    }

    // 查询权限角色
    if (Array.isArray(user.roles) && typeof user.roles[0] === 'number') {
      console.log('查询权限角色');
      user.roles = await this.rolesRepository.find({
        where: {
          id: In(user.roles),
        },
      });
    }

    const userTmp = await this.userRepository.create(user);

    // 加密操作
    userTmp.password = await argon2.hash(userTmp.password);

    const res = await this.userRepository.save(userTmp);
    return res;
  }

  async update(id: number, user: Partial<User>) {
    const userTemp = await this.findProfile(id);
    // 查询权限角色
    if (Array.isArray(user.roles) && typeof user.roles[0] === 'number') {
      user.roles = await this.rolesRepository.find({
        where: {
          id: In(user.roles),
        },
      });
    }
    const newUser = this.userRepository.merge(userTemp, user);

    // 加密操作
    newUser.password = await argon2.hash(newUser.password);

    // 联合模型更新, 需要使用save方法或queryBuilder
    return this.userRepository.save(newUser);

    // 单模型，不适合有关系的模型更新
    // return this.userRepository.update(newUser);
  }

  async remove(id: number) {
    return this.userRepository.delete(id);
    // const user = await this.findOne(id);
    // console.log('remove_id', id);
    // console.log('remove_user', user);
    // return this.userRepository.remove(user);
  }

  findProfile(id: number) {
    return this.userRepository.findOne({
      where: {
        id,
      },
      relations: {
        profile: true,
      },
    });
  }

  async findUserLogs(id: number) {
    const user = await this.findOne(id);
    return this.logsRepository.find({
      where: {
        user: user.logs,
      },
      // relations: {
      //   user: true,
      // },
    });
  }

  findLogsByGroup(id: number) {
    // SELECT logs.result as rest, COUNT(logs.result) as count from logs, user WHERE user.id = logs.userId AND user.id = 2 GROUP BY logs.result;
    // return this.logsRepository.query(
    //   'SELECT logs.result as rest, COUNT(logs.result) as count from logs, user WHERE user.id = logs.userId AND user.id = 2 GROUP BY logs.result',
    // );
    return (
      this.logsRepository
        .createQueryBuilder('logs')
        .select('logs.result', 'result')
        .addSelect('COUNT("logs.result")', 'count')
        .leftJoinAndSelect('logs.user', 'user')
        .where('user.id = :id', { id })
        .groupBy('logs.result')
        .orderBy('count', 'DESC')
        .addOrderBy('result', 'DESC')
        .offset(2)
        .limit(3)
        // .orderBy('result', 'DESC')
        .getRawMany()
    );
  }
}
