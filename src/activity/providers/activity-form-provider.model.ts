import { Activity, ActivityForm } from '@datamize-io/bitrix-lib-node';

export class ActivityFormProvider extends ActivityForm {
  getEntityTypeParam(): string | number | undefined {
    return this.getParamsFromLastPage().query.tid;
  }

  async moveToEntityOfSiteParameters(activityData): Promise<any> {
    const activity = new Activity(this.instance).patch(activityData, null);
    const query = activity.getParamsFromLastPage().query;
    const { tid, eid } = query;

    if (this.data.OWNER_ID !== tid) {
      throw Error('Não é permitido mover atividades entre entidades diferentes.');
    }

    try {
      await activity.moveTo(eid, tid);
    } catch (error: any) {
      console.log('Erro:', error.message);
    }
  }
}
