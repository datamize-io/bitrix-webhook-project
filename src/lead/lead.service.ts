import {
  BitrixInstance,
  Item,
  Lead,
  OpenLineChat,
  OpenLineOperator,
} from '@datamize-io/bitrix-lib-node';
import { Injectable } from '@nestjs/common';
import { DefaultService } from '../default/default.service.js';

@Injectable()
export class LeadService {
  constructor(
    private readonly bitrix: BitrixInstance,
    private readonly defaultService: DefaultService,
  ) {}

  async ONCRMLEADUPDATE(data, leadData): Promise<any> {
    await this.closeChatOnCloseLead(leadData);
  }

  async closeChatOnCloseLead(leadData) {
    await this.defaultService.closeChatOnCloseLead(leadData);
  }
}
