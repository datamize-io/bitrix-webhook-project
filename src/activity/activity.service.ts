import { Activity } from '@datamize-io/bitrix-lib-node';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ActivityService {
  async ONCRMACTIVITYDELETE(eventData, activityData): Promise<void> {}
  async ONCRMACTIVITYUPDATE(eventData, activityData): Promise<void> {}
  async ONCRMACTIVITYADD(eventData, activityData): Promise<void> {}
}
