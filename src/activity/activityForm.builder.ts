import { ActivityForm } from '@datamize-io/bitrix-lib-node';

export class ActivityFormBuilder extends ActivityForm {
  getEntityTypeParam(): string | number | undefined {
    return this.getParamsFromLastPage().query.tid;
  }
}
