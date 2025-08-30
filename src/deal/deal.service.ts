import { BitrixInstance } from '@datamize-io/bitrix-lib-node';
import { Injectable } from '@nestjs/common';
import { DefaultService } from '../default/default.service.js';

@Injectable()
export class DealService {
  constructor(
    private readonly bitrix: BitrixInstance,
    private readonly defaultService: DefaultService,
  ) {}

  async ONCRMDEALADD(eventData: any, dealData: any): Promise<any> {
    await this.startNewChatWhenDealIsCreated(dealData);
  }

  async ONCRMDEALDELETE(eventData: any, dealData: any): Promise<any> {
    const id = eventData.data.FIELDS.ID;

    await this.defaultService.closeAllChatsOfEntity({ id: id }, 'deal');
  }

  async startNewChatWhenDealIsCreated(dealData: any) {
    await this.defaultService.startNewChatWhenDealIsCreated(dealData);
  }
}
