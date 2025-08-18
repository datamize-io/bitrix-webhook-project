import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { join } from 'path';
import { NestExpressApplication } from '@nestjs/platform-express';

async function bootstrap() {
  console.log(`${process.env.BITRIX_WEBHOOK_URL}`);
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.setBaseViewsDir(join(process.cwd(), 'views'));
  app.setViewEngine('ejs');
  await app.listen(process.env.PORT ?? 3000, '0.0.0.0');
  console.log('Servidor em http://localhost:3000');
}
bootstrap();
