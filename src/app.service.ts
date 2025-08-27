import { Injectable } from '@nestjs/common';
import { ActivityService } from './activity/activity.service.js';
import { ContactService } from './contact/contact.service.js';
import { LeadService } from './lead/lead.service.js';
import { BitrixWebhookService } from './bitrix-webhook/bitrix-webhook.service.js';
import { DealService } from './deal/deal.service.js';

@Injectable()
export class AppService {
  private webhookServices: any[];
  constructor(
    private readonly bitrixWebhook: BitrixWebhookService,
    private readonly activityService: ActivityService,
    private readonly contactService: ContactService,
    private readonly leadService: LeadService,
    private readonly dealService: DealService,
  ) {
    this.webhookServices = [activityService, contactService, leadService, dealService];
  }

  async getHello(): Promise<string> {
    return await this.getExample();
  }

  async getExample(): Promise<string> {
    this.filterWebhookEvent({
      event: 'ONCRMDEALADD',
      event_handler_id: '243',
      data: { FIELDS: { ID: '9640', ENTITY_TYPE_ID: 1104 } },
      ts: '1755016010',
      auth: {
        domain: 'xxxxx.bitrix24.com.br',
        client_endpoint: 'https://xxxxx.bitrix24.com.br/rest/',
        server_endpoint: 'https://oauth.bitrix.info/rest/',
        member_id: 'xxxxxxx',
        application_token: 'xxxxxx',
      },
    });

    return `Testando`;
  }

  async filterWebhookEvent(event: any): Promise<void> {
    const triggerEventServices = this.bitrixWebhook.filterServiceEvents(
      this.webhookServices,
      event,
    );
    await this.bitrixWebhook.processServiceEvents(triggerEventServices, event);
  }
}
