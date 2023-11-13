import {
  ExceptionFilter,
  HttpAdapterHost,
  HttpException,
  HttpStatus,
  LoggerService,
  ArgumentsHost,
  Catch,
} from '@nestjs/common';

import * as requestIp from 'request-ip';
import { QueryFailedError } from 'typeorm';

@Catch()
export class AllExceptionFilter implements ExceptionFilter {
  constructor(
    private readonly logger: LoggerService,
    private readonly httpAdapterHost: HttpAdapterHost,
  ) {}
  catch(exception: unknown, host: ArgumentsHost) {
    const { httpAdapter } = this.httpAdapterHost;
    const ctx = host.switchToHttp();
    const request = ctx.getRequest();
    const response = ctx.getResponse();

    const httpStatus =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    let errMsg: string = exception['response'] || 'Internal Server Error';

    // 此处可以假如更多错误逻辑处理
    if (exception instanceof QueryFailedError) {
      errMsg = exception.message;
      if (exception.driverError.errno === 1062) {
        errMsg = '唯一索引冲突';
      }
    }

    const responseBody = {
      headers: request.headers,
      query: request.query,
      body: request.body,
      params: request.params,
      timestamp: new Date().toISOString(),
      // 还可以加入一些用户信息
      // IP信息
      ip: requestIp.getClientIp(request),
      exceptioin: exception['name'],
      error: errMsg,
    };

    this.logger.error('[attiy]', responseBody);
    httpAdapter.reply(response, responseBody, httpStatus);
  }
}
