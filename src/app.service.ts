import { Injectable } from '@nestjs/common';
import { BitrixLibService } from './bitrix-lib/bitrix-lib.service.js';
import { ActivityService } from './activity/activity.service.js';
import { ContactService } from './contact/contact.service.js';

@Injectable()
export class AppService {
  constructor(
    private readonly bitrixLibService: BitrixLibService,
    private readonly activityService: ActivityService,
    private readonly contactService: ContactService,
  ) {}

  async getHello(): Promise<string> {
    return await this.getExample();
  }

  async getExample(): Promise<string> {
    const testId = 121;
    this.filterWebhookEvent({
      event: 'ONCALENDARENTRYADD',
      event_handler_id: '243',
      data: { id: '869' },
      ts: '1755016010',
      auth: {
        domain: 'xxxxx.bitrix24.com.br',
        client_endpoint: 'https://xxxxx.bitrix24.com.br/rest/',
        server_endpoint: 'https://oauth.bitrix.info/rest/',
        member_id: 'xxxxxxx',
        application_token: 'xxxxxx',
      },
    });

    return `Testando ${testId}`;
  }

  async filterWebhookEvent(body: any): Promise<void> {
    console.log('Filtrando evento do webhook:', body);
    this.activityService.filter(body.event, body);
    this.contactService.filter(body.event, body);
  }
}
