import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { Logs } from '../logs/logs.entity';
import { getUserDto } from './dto/get-user.dto';
import { conditionUtils } from 'src/utils/db.helper';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    @InjectRepository(Logs) private readonly logsRepository: Repository<Logs>,
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
      'user.username': username,
      'profile.gender': gender,
      'roles.id': role,
    };

    const queryBuilder = this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.profile', 'profile')
      .leftJoinAndSelect('user.roles', 'roles');

    const newBuilder = conditionUtils<User>(queryBuilder, obj);

    return newBuilder.take(take).skip(skip).getMany();
  }

  find(username: string) {
    return this.userRepository.findOne({ where: { username } });
  }

  findOne(id: number) {
    return this.userRepository.findOne({ where: { id } });
  }

  async create(user: User) {
    const userTmp = await this.userRepository.create(user);
    const res = await this.userRepository.save(userTmp);
    return res;
  }

  async update(id: number, user: Partial<User>) {
    return this.userRepository.update(id, user);
  }

  remove(id: number) {
    return this.userRepository.delete(id);
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
        user,
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
