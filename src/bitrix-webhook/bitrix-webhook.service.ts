import { Injectable } from '@nestjs/common';
import {
  Activity,
  BitrixInstance,
  Calendar,
  Contact,
  ContactField,
  Deal,
  Lead,
} from '@datamize-io/bitrix-lib-node';

type EventData = {
  event: string;
  data: Record<any, any>;
};

@Injectable()
export class BitrixWebhookService {
  protected entityType: any;
  protected eventsEntities: Record<string, any> = {
    ONCRMACTIVITYDELETE: Activity,
    ONCRMACTIVITYUPDATE: Activity,
    ONCRMACTIVITYADD: Activity,
    ONCALENDARENTRYDELETE: Calendar,
    ONCALENDARENTRYUPDATE: Calendar,
    ONCALENDARENTRYADD: Calendar,
    ONCRMLEADDELETE: Lead,
    ONCRMLEADUPDATE: Lead,
    ONCRMLEADADD: Lead,
    ONCRMDEALDELETE: Deal,
    ONCRMDEALUPDATE: Deal,
    ONCRMDEALADD: Deal,
    ONCRMCONTACTUSERFIELDSETENUMVALUES: ContactField,
    ONCRMCONTACTUSERFIELDDELETE: ContactField,
    ONCRMCONTACTUSERFIELDUPDATE: ContactField,
    ONCRMCONTACTUSERFIELDADD: ContactField,
    ONCRMCONTACTDELETE: Contact,
    ONCRMCONTACTUPDATE: Contact,
    ONCRMCONTACTADD: Contact,
  };

  constructor(private readonly bitrix: BitrixInstance) {}

  filterServiceEvents(services: any[], eventData: EventData): any[] {
    return services.filter((service) => {
      const methodHandler = service[eventData.event];
      return typeof methodHandler === 'function';
    });
  }

  async processServiceEvents(services: any[], eventData: EventData) {
    const entity = await this.getEntityByEvent(eventData);
    services.forEach((service) => {
      console.log(
        `Evento: ${service.constructor.name}.${eventData.event}\nEntidade:${entity?.constructor?.name}`,
      );
      service[eventData.event](eventData, entity?.getData()).then((response) => {
        if (response) {
          console.log(`Resposta de ${eventData.event}: ${response}`);
        }
      });
    });
  }

  async getEntityByEvent(eventData: EventData) {
    const entity: any = this.eventsEntities[eventData.event];
    if (!entity) return undefined;

    const commonGets = ['Activity', 'Calendar', 'Deal', 'Lead', 'Contact'];
    if (commonGets.includes(entity.name)) {
      try {
        return new entity(this.bitrix).get(eventData.data.FIELDS.ID);
      } catch (error) {
        return undefined;
      }
    }
  }
}
