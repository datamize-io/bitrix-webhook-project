import { Activity, ActivityForm } from '@datamize-io/bitrix-lib-node';

export class ActivityFormProvider extends ActivityForm {
  static setActivity(activity: Activity) {
    return new this(activity.instance).patch(activity.getData());
  }

  getEntityTypeParam(): string | number | undefined {
    return this.getParamsFromLastPage().query.tid;
  }

  async moveToEntityOfSiteParameters(): Promise<any> {
    const query = this.getParamsFromLastPage().query;
    const { tid, eid } = query;

    if (this.data.OWNER_ID !== tid) {
      throw Error('Não é permitido mover atividades entre entidades diferentes.');
    }

    try {
      await this.moveTo(eid, tid);
    } catch (error: any) {
      console.log('Erro:', error.message);
    }
  }
}
