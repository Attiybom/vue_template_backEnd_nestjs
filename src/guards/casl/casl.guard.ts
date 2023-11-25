import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';
import { Reflector } from '@nestjs/core';
import { CaslAbilityService } from '../../auth/casl-ability.service';
import { CHECK_POLICIES_KEY } from 'src/enum/casl.enum';
import { CaslHandlerType } from 'src/decorator/casl.decorator';

@Injectable()
export class CaslGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private caslAbilityService: CaslAbilityService,
  ) {}

  // 三种情况：checkPoliciesHandler, checkPoliciesCan, checkPoliciesCannot
  async canActivate(context: ExecutionContext): Promise<boolean> {
    // 1. checkPoliciesHandler
    const handlers = this.reflector.getAllAndMerge<any[]>(
      CHECK_POLICIES_KEY.HANDLER,
      [context.getHandler(), context.getClass()],
    );

    // 2. checkPoliciesCan
    const canHandlers = this.reflector.getAllAndMerge<any[]>(
      CHECK_POLICIES_KEY.CAN,
      [context.getHandler(), context.getClass()],
    ) as CaslHandlerType;

    // 3. checkPoliciesCannot
    const cannotHandlers = this.reflector.getAllAndMerge<any[]>(
      CHECK_POLICIES_KEY.CANNOT,
      [context.getHandler(), context.getClass()],
    ) as CaslHandlerType;

    // 如果上述三种情况都没有，则直接返回true
    if (!handlers || !canHandlers || !cannotHandlers) {
      return true;
    }

    const req = context.switchToHttp().getRequest();

    if (!req.user) {
      return false;
    }

    const ability = await this.caslAbilityService.forRoot(req.user.username);

    let flag = true;
    if (handlers) {
      flag = flag && handlers.every((handler) => handler(ability));
    }
    if (flag && canHandlers) {
      if (Array.isArray(canHandlers)) {
        flag = flag && canHandlers.every((handler) => handler(ability));
      } else if (typeof canHandlers === 'function') {
        flag = flag && (await canHandlers(ability));
      }
    }

    if (flag && cannotHandlers) {
      if (Array.isArray(cannotHandlers)) {
        flag = flag && cannotHandlers.every((handler) => !handler(ability));
      } else if (typeof cannotHandlers === 'function') {
        flag = flag && (await cannotHandlers(ability));
      }
    }

    return flag;
  }
}
