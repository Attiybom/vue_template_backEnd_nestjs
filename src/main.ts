// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// import { Logger, HttpAdapterHost } from '@nestjs/common';
import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { AppModule } from './app.module';
import { AllExceptionFilter } from './filters/all-exception.filter';
import { Logger, ValidationPipe } from '@nestjs/common';
import { SerializeInterceptor } from './interceptors/serialize/serialize.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    // 关闭整个nestjs日志
    // logger: false,
    // logger: ['error', 'warn'],
  });
  app.useLogger(app.get(WINSTON_MODULE_NEST_PROVIDER));
  app.setGlobalPrefix('api/v1');

  // 引入全局错误返回
  // const httpAdapterHost = app.get(HttpAdapterHost);
  // const logger = new Logger();
  // app.useGlobalFilters(new AllExceptionFilter(logger, httpAdapterHost));

  // 引入全局的拦截器
  app.useGlobalPipes(
    new ValidationPipe({
      // 去除在类上不存在的字段，提高安全性如防止sql注入等
      whitelist: true,
    }),
  );

  // 全局拦截器
  // app.useGlobalInterceptors(new SerializeInterceptor());

  const port = 3000;
  await app.listen(port);
}
bootstrap();
