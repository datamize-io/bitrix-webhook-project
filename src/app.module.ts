import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { ConfigModule } from '@nestjs/config';
import { HelperModule } from './helper/helper.module.js';
import { BitrixInstanceModule } from './bitrix-instance/bitrix-instance.module.js';
import { DefaultService } from './default/default.service.js';
import { ActivityService } from './activity/activity.service.js';
import { ContactService } from './contact/contact.service.js';
import { LeadService } from './lead/lead.service.js';
import { BitrixWebhookService } from './bitrix-webhook/bitrix-webhook.service.js';
import { DealService } from './deal/deal.service.js';

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
  providers: [
    AppService,
    DefaultService,
    ActivityService,
    ContactService,
    LeadService,
    BitrixWebhookService,
    DealService,
  ],
})
export class AppModule {}
