import { Calendar } from '@datamize-io/bitrix-lib-node';
import { Injectable } from '@nestjs/common';
import { WebhookBaseService } from '../webhook-base/webhook-base.service.js';

@Injectable()
export class CalendarService extends WebhookBaseService {
  protected entityType = Calendar;
  protected events: string[] = [
    'ONCALENDARSECTIONDELETE',
    'ONCALENDARSECTIONUPDATE',
    'ONCALENDARSECTIONADD',
    'ONCALENDARENTRYDELETE',
    'ONCALENDARENTRYUPDATE',
    'ONCALENDARENTRYADD',
  ];

  async ONCALENDARSECTIONDELETE(data): Promise<void> {}
  async ONCALENDARSECTIONUPDATE(data): Promise<void> {}
  async ONCALENDARSECTIONADD(data): Promise<void> {}
  async ONCALENDARENTRYDELETE(data): Promise<void> {}
  async ONCALENDARENTRYUPDATE(data): Promise<void> {}
  async ONCALENDARENTRYADD(data): Promise<void> {}
}
