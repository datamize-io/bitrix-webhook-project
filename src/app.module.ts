import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { BitrixLibService } from './bitrix-lib/bitrix-lib.service.js';
import { BitrixLibModule } from './bitrix-lib/bitrix-lib.module.js';
import { ConfigModule } from '@nestjs/config';
import { ActivityService } from './activity/activity.service.js';
import { ContactService } from './contact/contact.service.js';
import { WebhookBaseService } from './webhook-base/webhook-base.service.js';
import { CalendarService } from './calendar/calendar.service.js';
import { HelperModule } from './helper/helper.module.js';
import { IndicacaoSpaService } from './indicacao-spa/indicacao-spa.service.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // torna disponível em toda a aplicação
      envFilePath: '.env', // caminho do arquivo de variáveis
    }),
    BitrixLibModule,
    HelperModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    BitrixLibService,
    ActivityService,
    ContactService,
    WebhookBaseService,
    CalendarService,
    IndicacaoSpaService,
  ],
})
export class AppModule {}
