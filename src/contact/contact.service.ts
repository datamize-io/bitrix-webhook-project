import { Injectable } from '@nestjs/common';
import {
  BitrixInstance,
  Contact,
  Item,
  OpenLineChat,
  OpenLineOperator,
} from '@datamize-io/bitrix-lib-node';
import { HelperService } from '../helper/helper.service.js';

@Injectable()
export class ContactService {
  constructor(private readonly bitrix: BitrixInstance) {}

  async ONCRMCONTACTUSERFIELDSETENUMVALUES(eventData, contactData): Promise<void> {}
  async ONCRMCONTACTUSERFIELDDELETE(eventData, contactData): Promise<void> {}
  async ONCRMCONTACTUSERFIELDUPDATE(eventData, contactData): Promise<void> {}
  async ONCRMCONTACTUSERFIELDADD(eventData, contactData): Promise<void> {}
  async ONCRMCONTACTUPDATE(eventData, contactData): Promise<void> {}
  async ONCRMCONTACTDELETE(eventData, contactData): Promise<void> {
    const id = eventData.data.FIELDS.ID;

    await this.closeAllChats({ id });
  }

  async ONCRMCONTACTADD(eventData, contactData): Promise<void> {
    await this.mergeIfContactHasDuplicates(contactData);
    await this.setAllFormatsOfPhoneNumber(contactData);
  }

  async closeAllChats(contactData: { id: number }) {
    const contactChats = await new OpenLineChat(this.bitrix).getChatsByEntityId(
      'contact',
      Number(contactData.id),
    );

    contactChats.getData().forEach(async (chat) => {
      const operator = new OpenLineOperator(this.bitrix).finishChat(chat.getData().CHAT_ID);
    });
    console.log(`>>> Todos os chats do negócio foram encerrados.`);
  }

  async mergeIfContactHasDuplicates(contactData: any): Promise<number> {
    const contact = await new Contact(this.bitrix).patch(contactData, null);

    const duplicates = await contact.getDuplications();
    console.log(`Duplicatas encontradas:`, duplicates.length);

    const olderContactId = duplicates.pop();

    for (const contactId of duplicates) {
      const item = await new Contact(this.bitrix);
      const duplicatedContact = await item.get(contactId);
      await duplicatedContact.transferAllActivitiesTo(olderContactId);
      await duplicatedContact.transferAllCommentsTo(olderContactId);
      await duplicatedContact.transferEntitiesTo(olderContactId);
      await duplicatedContact.transferAllFieldsTo(olderContactId);
      await duplicatedContact.clearAllFieldsOfItem();
      await duplicatedContact.delete(contactId);
      await item
        .setId(olderContactId)
        .addTimelineLogEntry(
          `Mesclagem recebida`,
          `Foram movidas todas as informações do Contato #${contactData.id} para este contato.`,
        );
    }

    console.log(`Duplicações corrigidas, contato mais antigo ${olderContactId || contactData.id}.`);

    return olderContactId || contactData.id;
  }

  async setAllFormatsOfPhoneNumber(contactData) {
    if (!contactData.phone) return 'Não possui telefone cadastrado.';

    const contact = new Contact(this.bitrix).patch(contactData);
    const allPhones = contactData.fm
      .filter((fieldMultiple) => fieldMultiple.typeId == 'PHONE')
      .map((contactPhone) => contactPhone.value);

    const phoneVariations = HelperService.getAllVariationsOfSamePhones(allPhones).filter(
      (phone) => !allPhones.includes(phone),
    );

    phoneVariations.forEach((phone) => {
      contact.setPhone(phone, 'MOBILE');
    });

    if (phoneVariations.length > 0) {
      contact.update({
        id: contactData.id,
        fields: {
          fm: contact.getData().fm,
        },
      });
      console.log(
        `Adicionadas variações extras de telefone para o contato: ${phoneVariations.join(' ')}`,
      );
    }
  }
}
