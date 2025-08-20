import {
  Activity,
  BitrixInstance,
  Contact,
  Deal,
  Duplicate,
  Item,
} from '@datamize-io/bitrix-lib-node';
import { Injectable } from '@nestjs/common';
import { BitrixLibService } from '../bitrix-lib/bitrix-lib.service.js';
import { WebhookBaseService } from '../webhook-base/webhook-base.service.js';
import { ContactService } from '../contact/contact.service.js';
import { HelperService } from '../helper/helper.service.js';

@Injectable()
export class IndicacaoSpaService extends WebhookBaseService {
  protected entityType = Item;
  protected events: string[] = [
    'ONCRMDYNAMICITEMDELETE',
    'ONCRMDYNAMICITEMUPDATE',
    'ONCRMDYNAMICITEMADD',
    'ONCRMACTIVITYADD',
    'ONCRMDEALADD',
  ];
  private entityTypeId = 1104;

  constructor(
    protected bitrixLibService: BitrixLibService,
    protected contactService: ContactService,
  ) {
    //51524
    super(bitrixLibService);
  }

  get entity() {
    return new this.entityType(this.instance).setEntityTypeId(this.entityTypeId);
  }

  async ONCRMACTIVITYADD(eventData): Promise<void> {
    console.log(eventData);
    const id = eventData.data.FIELDS.ID;
    try {
      new Activity(this.instance).get(id).then(async (activity) => {
        const activityData = activity.getData();

        console.log(activityData.PROVIDER_ID);
        if (activityData.PROVIDER_ID == 'CRM_WEBFORM' && activityData.PROVIDER_TYPE_ID == 16) {
          console.log(activityData.PROVIDER_PARAMS.FIELDS);
        }
      });
    } catch (error: any) {
      console.log(error.message);
    }
  }

  async ONCRMDEALADD(eventData): Promise<void> {
    console.log(eventData);
    const id = eventData.data.FIELDS.ID;
    try {
      await new Deal(this.instance).get(id).then(async (deal) => {
        const dealData = deal.getData();

        console.log('Linkando...');
        await this.linkBuyerOnSellerSPA(dealData);
      });
    } catch (error: any) {
      console.log(error.message);
    }
  }

  async ONCRMDYNAMICITEMADD(eventData): Promise<void> {
    console.log(eventData);
    if (eventData.data.FIELDS.ENTITY_TYPE_ID !== this.entityTypeId)
      throw Error('Não pertence a SPA');

    const id = eventData.data.FIELDS.ID;
    try {
      this.entity.get(id).then(async (indicacao) => {
        const indicacaoData = indicacao.getData();

        //await this.linkBuyerOnSellerSPA(indicacaoData);
      });
    } catch (error: any) {
      console.log(error.message);
    }
  }

  async linkBuyerOnSellerSPA(refDealData) {
    // Condições para rodar automação
    if (refDealData.categoryId !== 22) throw Error('Não está no Pipeline individual.'); // Pipeline Individual
    if (Number(refDealData.sourceId) !== 3) throw Error('Não possui origem de indicação'); // Origem do negócio igual a Formulário de Indicação
    if (!refDealData.UF_CRM_DEAL_1739905877960)
      throw Error('Não possui telefone do proprietário preenchido'); // Telefone do proprietário não vier preenchido

    const dealRef = new Item(this.instance).patch(refDealData, null);
    const contact = await new Item(this.instance).setEntityTypeId(3).get(refDealData.contactId);
    const sellerPhone = refDealData.UF_CRM_DEAL_1739905877960;

    try {
      // Espera o merge de duplicados antes de fazer qualquer associação
      await this.contactService
        .mergeIfContactHasDuplicates(contact.getData())
        .then(async (olderContactOfDuplication) => {
          console.log(`Duplicações corrigidas, contato mais antigo ${olderContactOfDuplication}.`);

          // Busca ID do proprietário através do Telefone
          const phoneVariations = HelperService.getAllVariationsOfSamePhones([sellerPhone]);
          const duplicate = await new Duplicate(this.instance).findByType(
            'CONTACT',
            'PHONE',
            phoneVariations,
          );
          const sellerId = duplicate[0];

          if (sellerPhone) {
            if (olderContactOfDuplication && sellerId) {
              const contact = await new Contact(this.instance).get(olderContactOfDuplication);
              const contactData = contact.getData();

              // Cria a SPA de Indicação
              await new Item(this.instance).setEntityTypeId(this.entityTypeId).insert({
                fields: {
                  title: contactData.name,
                  UF_CRM_32_INDICADO: contactData.id,
                  contactId: sellerId,
                  parentId2: refDealData.id,
                },
              });

              // Adiciona registro de vínculo
              await dealRef.addTimelineLogEntry(
                'Indicação vinculada',
                `O negócio atual recebeu vínculo com a indicação.`,
              );

              // Atualiza proprietário no negócio atual
              await dealRef.update({
                id: refDealData.id,
                entityTypeId: 2,
                fields: {
                  UF_CRM_1752162173: sellerId,
                },
              });
            }
          }
        });
    } catch (error: any) {
      console.log(error.message);
      throw Error(error.message);
    }
  }
}
