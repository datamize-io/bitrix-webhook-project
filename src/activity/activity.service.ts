import { Activity, Item } from '@datamize-io/bitrix-lib-node';
import { Injectable } from '@nestjs/common';
import { ActivityFormBuilder } from './activityForm.builder.js';
import { WebhookBaseService } from '../webhook-base/webhook-base.service.js';

@Injectable()
export class ActivityService extends WebhookBaseService {
  protected entityType = Activity;
  protected events: string[] = ['ONCRMACTIVITYDELETE', 'ONCRMACTIVITYUPDATE', 'ONCRMACTIVITYADD'];

  async ONCRMACTIVITYDELETE(data): Promise<void> {}
  async ONCRMACTIVITYUPDATE(data): Promise<void> {}
  async ONCRMACTIVITYADD(data): Promise<void> {
    const id = data.data.FIELDS.ID;

    try {
      const formEntity = this.bitrixLibService.getInstance().entity(ActivityFormBuilder);

      formEntity.get(id).then(async (activity) => {
        const query = activity.getParamsFromLastPage().query;
        const { tid, eid } = query;
        //const item = new Item(this.instance).setEntityTypeId(tid).get(eid);

        if (activity.data.OWNER_ID !== tid) {
          throw Error('Não eé permitido mover atividades entre entidades diferentes.');
        }
        try {
          await activity.moveTo(eid, tid);
        } catch (error: any) {
          console.log('Erro:', error.message);
        }
      });
    } catch (error: any) {
      console.log(error.message);
    }
  }
}
