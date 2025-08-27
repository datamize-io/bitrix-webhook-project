// src/bitrix-instance/bitrix-instance.module.ts
import { Global, Module } from '@nestjs/common';
import { BitrixInstance } from '@datamize-io/bitrix-lib-node';
import { BitrixProviders, BITRIX_INSTANCE } from './bitrix-instance.providers.js';
import { ActivityService } from '../activity/activity.service.js';
import { ContactService } from '../contact/contact.service.js';
import { LeadService } from '../lead/lead.service.js';
import { BitrixWebhookService } from '../bitrix-webhook/bitrix-webhook.service.js';
import { DefaultService } from '../default/default.service.js';

@Global() // opcional: torne disponível app-wide sem precisar importar sempre
@Module({
  providers: [
    ...BitrixProviders, // factory + SecretManager client
    {
      provide: BitrixInstance,
      useExisting: BITRIX_INSTANCE,
    },
  ],
  exports: [
    BITRIX_INSTANCE, // token (caso queira usar com @Inject)
    BitrixInstance, // alias por tipo (injeção direta)
    ...BitrixProviders, // exporta também, se quiser reusar o SM client
  ],
})
export class BitrixInstanceModule {}
