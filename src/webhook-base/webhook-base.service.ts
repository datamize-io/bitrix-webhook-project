import { Injectable } from '@nestjs/common';
import { BitrixLibService } from '../bitrix-lib/bitrix-lib.service.js';
import { BitrixInstance } from '@datamize-io/bitrix-lib-node';

@Injectable()
export class WebhookBaseService {
  protected instance: BitrixInstance;
  protected entityType: any;
  protected events: string[] = [];

  constructor(protected readonly bitrixLibService: BitrixLibService) {
    console.log('ActivityService initialized with events:', this.events);
    this.instance = bitrixLibService.getInstance();
  }

  get entity() {
    return this.bitrixLibService.getInstance().entity(this.entityType!);
  }

  filter(event: string, data): void {
    if (this.events.includes(event)) {
      const methodHandler = this[event];
      if (typeof methodHandler === 'function') {
        console.log(`Handling event: ${event} with data to entity ${this.constructor.name}:`, data);
        this[event](data);
      } else {
        console.warn(`No handler found for event: ${event} in entity ${this.constructor.name}`);
      }
    }
  }

  async processEventTo(entityId: string | number, functionCallback: any): Promise<void> {
    return await this.entity.get(entityId).then((entity) => functionCallback(entity));
  }
}
