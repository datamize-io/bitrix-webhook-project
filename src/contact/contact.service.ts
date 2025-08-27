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

  async ONCRMCONTACTUSERFIELDSETENUMVALUES(eventData, contactData): Promise<any> {}
  async ONCRMCONTACTUSERFIELDDELETE(eventData, contactData): Promise<any> {}
  async ONCRMCONTACTUSERFIELDUPDATE(eventData, contactData): Promise<any> {}
  async ONCRMCONTACTUSERFIELDADD(eventData, contactData): Promise<any> {}
  async ONCRMCONTACTUPDATE(eventData, contactData): Promise<any> {}
  async ONCRMCONTACTDELETE(eventData, contactData): Promise<any> {
    const id = eventData.data.FIELDS.ID;

    await this.closeAllContactChats({ id });
  }

  async ONCRMCONTACTADD(eventData, contactData): Promise<any> {
    console.log(eventData);
    if (!contactData) {
      return `Os dados da entidade não foram passadas para ${this.constructor.name}.${eventData.event}(eventData,entityData)`;
    }
    const newContactData = await this.mergeIfContactHasDuplicates(contactData);

    // Se não sofrer alterações no merge
    if (newContactData.id == contactData.id) {
      await this.setAllFormatsOfPhoneNumberOnContact(contactData);
    }
  }

  async closeAllContactChats(contactData: { id: number }) {
    return await this.defaultService.closeAllContactChats(contactData);
  }

  async mergeIfContactHasDuplicates(contactData: any): Promise<any> {
    return await this.defaultService.mergeIfContactHasDuplicates(contactData);
  }

  async setAllFormatsOfPhoneNumberOnContact(contactData) {
    return await this.defaultService.setAllFormatsOfPhoneNumberOnContact(contactData);
  }
}
