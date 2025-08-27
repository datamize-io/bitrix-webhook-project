import { Injectable } from '@nestjs/common';
import {
  BitrixInstance,
  Contact,
  Item,
  OpenLineChat,
  OpenLineOperator,
} from '@datamize-io/bitrix-lib-node';
import { HelperService } from '../helper/helper.service.js';
import { DefaultService } from '../default/default.service.js';

@Injectable()
export class ContactService {
  constructor(
    private readonly bitrix: BitrixInstance,
    private readonly defaultService: DefaultService,
  ) {}

  async ONCRMCONTACTUSERFIELDSETENUMVALUES(eventData, contactData): Promise<void> {}
  async ONCRMCONTACTUSERFIELDDELETE(eventData, contactData): Promise<void> {}
  async ONCRMCONTACTUSERFIELDUPDATE(eventData, contactData): Promise<void> {}
  async ONCRMCONTACTUSERFIELDADD(eventData, contactData): Promise<void> {}
  async ONCRMCONTACTUPDATE(eventData, contactData): Promise<void> {}
  async ONCRMCONTACTDELETE(eventData, contactData): Promise<void> {
    const id = eventData.data.FIELDS.ID;

    await this.closeAllContactChats({ id });
  }

  async ONCRMCONTACTADD(eventData, contactData): Promise<void> {
    await await this.mergeIfContactHasDuplicates(contactData);
    await await this.setAllFormatsOfPhoneNumberOnContact(contactData);
  }

  async closeAllContactChats(contactData: { id: number }) {
    return await this.defaultService.closeAllContactChats(contactData);
  }

  async mergeIfContactHasDuplicates(contactData: any): Promise<number> {
    return await this.defaultService.mergeIfContactHasDuplicates(contactData);
  }

  async setAllFormatsOfPhoneNumberOnContact(contactData) {
    return await this.defaultService.setAllFormatsOfPhoneNumberOnContact(contactData);
  }
}
