import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { Observable, map } from 'rxjs';

@Injectable()
export class SerializeInterceptor implements NestInterceptor {
  constructor(private dto: any) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    // const req = context.switchToHttp().getRequest();
    // console.log('拦截器之前', req);
    return next.handle().pipe(
      map((data) => {
        // console.log('拦截器之后', data);
        return plainToInstance(this.dto, data, {
          //excludeExtraneousValues设置为true后，所有经过该interceptor后的接口，都需要设置expose or exclude
          //expose => 设置哪些字段需要暴露
          //exclude => 设置哪些字段不需要
          excludeExtraneousValues: true,
        });
      }),
    );
  }
}
