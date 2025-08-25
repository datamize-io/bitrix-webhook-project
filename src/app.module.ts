import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { ConfigModule } from '@nestjs/config';
import { HelperModule } from './helper/helper.module.js';
import { BitrixInstanceModule } from './bitrix-instance/bitrix-instance.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // torna disponível em toda a aplicação
      envFilePath: '.env', // caminho do arquivo de variáveis
    }),
    HelperModule,
    BitrixInstanceModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
