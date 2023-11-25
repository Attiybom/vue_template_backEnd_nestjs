import { AnyMongoAbility, InferSubjects } from '@casl/ability';
import { SetMetadata } from '@nestjs/common';
import { Action } from 'src/enum/action.enum';
import { CHECK_POLICIES_KEY } from 'src/enum/casl.enum';

export type PolicyHandlerCallback = (
  ability: AnyMongoAbility,
) => boolean | Promise<boolean>;

export type CaslHandlerType = PolicyHandlerCallback | PolicyHandlerCallback[];

// 效果
// guards 读取到 route 的 metadata => @CheckPolicies @Can @Cannot
// 使用方法
// @CheckPolicies -> 接收handler -> 需要传ability -> 返回boolean
export const CheckPolicies = (...handlers: PolicyHandlerCallback[]) =>
  SetMetadata(CHECK_POLICIES_KEY.HANDLER, handlers);

// @Can -> 接收Action,subject,condition
export const Can = (
  action: Action,
  subject: InferSubjects<any>,
  condition?: any,
) =>
  SetMetadata(CHECK_POLICIES_KEY.CAN, (ability: AnyMongoAbility) =>
    ability.can(action, subject, condition),
  );

// @Cannot -> 接收Action,subject,condition
export const Cannot = (
  action: Action,
  subject: InferSubjects<any>,
  condition?: any,
) =>
  SetMetadata(CHECK_POLICIES_KEY.CANNOT, (ability: AnyMongoAbility) =>
    ability.cannot(action, subject, condition),
  );
