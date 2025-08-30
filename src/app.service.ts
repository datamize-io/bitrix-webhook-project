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
      event: 'ONCRMCONTACTADD',
      data: { FIELDS: { ID: '153' } },
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
