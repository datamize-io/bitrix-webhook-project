import {
  Activity,
  Item,
  OpenLine,
  OpenLineChat,
  OpenLineDialog,
} from '@datamize-io/bitrix-lib-node';
import { Injectable } from '@nestjs/common';
import { ActivityFormProvider } from './providers/activity-form-provider.model.js';
import { WebhookBaseService } from '../webhook-base/webhook-base.service.js';
import { ActivityOpenlineSessionProvider } from './providers/activity-openline-session-provider.model.js';

@Injectable()
export class ActivityService extends WebhookBaseService {
  protected entityType = Activity;
  protected events: string[] = ['ONCRMACTIVITYDELETE', 'ONCRMACTIVITYUPDATE', 'ONCRMACTIVITYADD'];

  async ONCRMACTIVITYDELETE(data): Promise<void> {}
  async ONCRMACTIVITYUPDATE(data): Promise<void> {
    const id = data.data.FIELDS.ID;
    try {
      this.entity.get(id).then(async (activity) => {
        const activityData = activity.getData();
        console.log('📨 Evento recebido em ONCRMACTIVITYUPDATE:');
        console.log(`Provider: ${activityData.PROVIDER_ID}`);

        if (activityData.PROVIDER_ID == 'IMOPENLINES_SESSION') {
          const dialog = new ActivityOpenlineSessionProvider(activity.instance);
        }
      });
    } catch (error: any) {
      console.log(error.message);
    }
  }

  async ONCRMACTIVITYADD(data): Promise<void> {
    const id = data.data.FIELDS.ID;
    try {
      this.entity.get(id).then(async (activity) => {
        const activityData = activity.getData();
        console.log('📨 Evento recebido em ONCRMACTIVITYADD:');
        console.log(`Provider: ${activityData.PROVIDER_ID}`);

        if (activityData.PROVIDER_ID == 'FORM_SUBMIT') {
          const form = ActivityFormProvider.setActivity(activity);

          await form.moveToEntityOfSiteParameters();
        }

        console.log(activityData.PROVIDER_ID);
        if (activityData.PROVIDER_ID == 'IMOPENLINES_SESSION') {
          const dialog = new ActivityOpenlineSessionProvider(activity.instance);
        }
      });
    } catch (error: any) {
      console.log(error.message);
    }
  }
}
