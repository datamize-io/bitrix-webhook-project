import { Activity, BitrixInstance } from '@datamize-io/bitrix-lib-node';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ActivityService {
  constructor(private readonly bitrix: BitrixInstance) {}
  async ONCRMACTIVITYDELETE(eventData, activityData): Promise<any> {}
  async ONCRMACTIVITYUPDATE(eventData, activityData): Promise<any> {}
  async ONCRMACTIVITYADD(eventData, activityData): Promise<any> {}
}
