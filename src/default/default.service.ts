import {
  BitrixInstance,
  Contact,
  Deal,
  Lead,
  OpenLineChat,
  OpenLineDialog,
  OpenLineOperator,
} from '@datamize-io/bitrix-lib-node';
import { Injectable } from '@nestjs/common';
import { HelperService } from '../helper/helper.service.js';

@Injectable()
export class DefaultService {
  constructor(private readonly bitrix: BitrixInstance) {}

  async startNewChatWhenDealIsCreated(dealData) {
    console.log(`DealId: ${dealData.id}`);

    let chatId;
    try {
      const dealChat = await new OpenLineChat(this.bitrix).getLastChatIdByEntityId(
        'DEAL',
        dealData.id,
      );
      chatId = dealChat.getData();
    } catch (error: any) {
      try {
        const contactChat = await new OpenLineChat(this.bitrix).getLastChatIdByEntityId(
          'CONTACT',
          dealData.contactId,
        );
        chatId = contactChat.getData();
      } catch (error: any) {
        console.log(error);
      }
    }

    if (chatId) {
      const dialog = await new OpenLineDialog(this.bitrix).getByChatId(chatId);
      await dialog.startNewDialogSession();

      const operator = await new OpenLineOperator(this.bitrix).transfer(
        chatId,
        dealData.assignedById,
      );

      return 'Sucesso na transferência de chat para o novo negócio.';
    } else {
      new Deal(this.bitrix)
        .setId(dealData.id)
        .addTimelineLogEntry(
          'Chat não iniciado',
          'Não foi encontrado um chat existente, nem para o Negócio e nem para o Contato.',
        );
    }
  }

  async closeChatOnCloseLead(leadData) {
    const leadStatus = leadData.STATUS_SEMANTIC_ID || leadData.stageSemanticId;
    if (!leadStatus) return `Lead não possui status de semantica`;
    if (leadStatus == 'P') return 'Lead está aberto ainda.';
    console.log(`LeadId: ${leadData.id}`);
    console.log(leadData);
    const chats = await new OpenLineChat(this.bitrix).getChatsByEntityId(
      'lead',
      Number(leadData.id),
      'Y',
    );

    chats.getData().forEach(async (chat) => {
      const chatId = chat.CHAT_ID;
      new OpenLineOperator(this.bitrix).finishChat(chatId).then((value) => {
        console.log(`Encerrado chat do lead. (${value})`);
        new Lead(this.bitrix)
          .setId(leadData.id)
          .addTimelineLogEntry('Chat encerrado', 'Chat foi encerrado pois lead foi concluído.');
      });
    });
  }

  async closeAllContactChats(contactData: { id: number }) {
    const contactChats = await new OpenLineChat(this.bitrix).getChatsByEntityId(
      'contact',
      Number(contactData.id),
    );

    contactChats.getData().forEach(async (chat) => {
      const operator = new OpenLineOperator(this.bitrix).finishChat(chat.getData().CHAT_ID);
    });
    console.log(`>>> Todos os chats do negócio foram encerrados.`);
  }

  async mergeIfContactHasDuplicates(contactData: any): Promise<any> {
    let contact = await new Contact(this.bitrix).patch(contactData, null);
    let wasMerged = false;

    const duplicates = await contact.getDuplications();
    console.log(`Duplicatas encontradas:`, duplicates.length);

    const olderContactId = duplicates.pop();

    for (const contactId of duplicates) {
      wasMerged = true;
      const item = await new Contact(this.bitrix);
      const duplicatedContact = await item.get(contactId);
      await duplicatedContact.transferAllActivitiesTo(olderContactId);
      await duplicatedContact.transferAllCommentsTo(olderContactId);
      await duplicatedContact.transferEntitiesTo(olderContactId);
      await duplicatedContact.transferAllFieldsTo(olderContactId);
      await duplicatedContact.clearAllFieldsOfItem();
      await duplicatedContact.delete(contactId);
      console.log(`>> Contato ${contactId} deletado por duplicação.`);

      await new Contact(this.bitrix)
        .setId(olderContactId)
        .addTimelineLogEntry(
          `Mesclagem recebida`,
          `Foram movidas todas as informações do Contato #${contactData.id} para este contato.`,
        );
    }

    if (olderContactId !== contactData.id) {
      contact = await new Contact(this.bitrix).get(olderContactId);
      contactData = contact.getData();
    }

    console.log(`Duplicações corrigidas, contato mais antigo ${olderContactId || contactData.id}.`);

    return contactData;
  }

  async setAllFormatsOfPhoneNumberOnContact(contactData) {
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
