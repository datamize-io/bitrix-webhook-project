import {
  BitrixInstance,
  Item,
  Lead,
  OpenLineChat,
  OpenLineOperator,
} from '@datamize-io/bitrix-lib-node';
import { Injectable } from '@nestjs/common';

@Injectable()
export class LeadService {
  constructor(private readonly bitrix: BitrixInstance) {}

  async ONCRMLEADUPDATE(data, leadData): Promise<void> {
    await this.closeChatOnCloseLead(leadData);
  }

  async closeChatOnCloseLead(leadData) {
    if (leadData.STATUS_SEMANTIC_ID == 'P') return 'Lead está aberto ainda.';
    const chats = await new OpenLineChat(this.bitrix).getChatsByEntityId(
      'lead',
      Number(leadData.id),
    );

    //console.log(`Total de chats abertos: ${chats.getData().length}.`);
    chats.getData().forEach(async (chat) => {
      new OpenLineOperator(this.bitrix).finishChat(chat.data.CHAT_ID).then((value) => {
        console.log(`Encerrado chat do lead. (${value})`);
        new Item(this.bitrix)
          .setId(leadData.id)
          .setEntityTypeId(1)
          .addTimelineLogEntry('Chat encerrado', 'Chat foi encerrado pois lead foi concluído.');
      });
    });
  }
}
