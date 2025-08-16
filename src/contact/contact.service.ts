import { Injectable } from '@nestjs/common';
import { WebhookBaseService } from '../webhook-base/webhook-base.service.js';
import { Contact, OpenLineChat, OpenLineOperator } from '@datamize-io/bitrix-lib-node';

@Injectable()
export class ContactService extends WebhookBaseService {
  protected entityType = Contact;
  protected events: string[] = [
    'ONCRMCONTACTUSERFIELDSETENUMVALUES',
    'ONCRMCONTACTUSERFIELDDELETE',
    'ONCRMCONTACTUSERFIELDUPDATE',
    'ONCRMCONTACTUSERFIELDADD',
    'ONCRMCONTACTDELETE',
    'ONCRMCONTACTUPDATE',
    'ONCRMCONTACTADD',
  ];

  async ONCRMCONTACTUSERFIELDSETENUMVALUES(data): Promise<void> {}
  async ONCRMCONTACTUSERFIELDDELETE(data): Promise<void> {}
  async ONCRMCONTACTUSERFIELDUPDATE(data): Promise<void> {}
  async ONCRMCONTACTUSERFIELDADD(data): Promise<void> {}
  async ONCRMCONTACTDELETE(data): Promise<void> {
    const id = data.data.FIELDS.ID;
    const instance = this.bitrixLibService.getInstance();
    const contactChats = await new OpenLineChat(instance).getChatsByEntityId(
      'contact',
      parseInt(id),
    );

    contactChats.data.forEach(async (chat) => {
      console.log(chat);
      const operator = new OpenLineOperator(instance).finishChat(chat.data.CHAT_ID);
    });
  }
  async ONCRMCONTACTUPDATE(data): Promise<void> {}
  async ONCRMCONTACTADD(data): Promise<void> {}
}
