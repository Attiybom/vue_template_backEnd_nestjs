import { IsNotEmpty, IsString, Length } from 'class-validator';

export class SigninUserDto {
  @IsString({
    message: '用户名必须为字符串',
  })
  @IsNotEmpty({
    message: `用户名不得为空`,
  })
  @Length(6, 20, {
    // $value: 当前用户传入的值
    // $property: 当前属性名
    // $target: 当前类
    // $constraint1: 最短长度，如这里就等于6
    // $constraint2: 最长长度，如这里就等于20
    message: `用户名的长度必须在$constraint1到$constraint2之间，不符合规则的是$value`,
  })
  username: string;

  @IsString({
    message: `密码必须为字符串`,
  })
  @IsNotEmpty({
    message: '密码不得为空',
  })
  @Length(6, 32, {
    message: `密码的长度必须在$constraint1到$constraint2之间，不符合规则的是$value`,
  })
  password: string;
}
