import { Injectable } from '@nestjs/common';
import { WebhookBaseService } from '../webhook-base/webhook-base.service.js';
import { Contact, Item, OpenLineChat, OpenLineOperator } from '@datamize-io/bitrix-lib-node';

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
    const contactChats = await new OpenLineChat(instance).getChatsByEntityId('contact', Number(id));

    contactChats.data.forEach(async (chat) => {
      console.log(chat);
      const operator = new OpenLineOperator(instance).finishChat(chat.data.CHAT_ID);
    });
  }
  async ONCRMCONTACTUPDATE(data): Promise<void> {}
  async ONCRMCONTACTADD(eventData): Promise<void> {
    const id = eventData.data.FIELDS.ID;
    this.entity.get(id).then(async (contact: Contact) => {
      const contactData = contact.getData();

      console.log(await this.mergeIfContactHasDuplicates(contactData));
    });
  }

  async mergeIfContactHasDuplicates(contactData: any): Promise<number> {
    const contact = await new Contact(this.instance).patch(contactData, null);

    const duplicates = await contact.getDuplications();
    console.log(`Duplicatas encontradas:`, duplicates.length);

    const olderContactId = duplicates.pop();

    for (const contactId of duplicates) {
      console.log(contactId, duplicates);
      const item = await new Item(this.instance).setEntityTypeId(3);
      const duplicatedContact = await item.get(contactId);
      await duplicatedContact.transferAllActivitiesTo(olderContactId);
      await duplicatedContact.transferAllCommentsTo(olderContactId);
      await duplicatedContact.transferEntitiesTo(olderContactId);
      await duplicatedContact.transferAllFieldsTo(olderContactId);
      await duplicatedContact.clearAllFieldsOfItem();
      //await duplicatedContact.delete(contactId);
      await item
        .setId(olderContactId)
        .addTimelineLogEntry(
          `Mesclagem recebida`,
          `Foram movidas todas as informações do Contato #${contactData.id} para este contato.`,
        );
    }

    return olderContactId || contactData.id;
  }
}
