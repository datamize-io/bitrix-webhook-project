import { Injectable } from '@nestjs/common';
import { BitrixInstance } from '@datamize-io/bitrix-lib-node';

@Injectable()
export class BitrixLibService {
  private bitrixInstance!: BitrixInstance;

  constructor() {
    console.log(process.env.BITRIX_WEBHOOK_URL);
    const bitrixInstance = new BitrixInstance({
      b24Url: process.env.BITRIX_WEBHOOK_URL!,
      userId: parseInt(process.env.BITRIX_WEBHOOK_USER_ID!),
      secret: process.env.BITRIX_WEBHOOK_SECRET!,
    });

    this.setBitrixInstance(bitrixInstance);
  }

  getInstance(): BitrixInstance {
    if (!this.bitrixInstance) {
      throw Error('BitrixInstance ainda não está instanciado.');
    }

    return this.bitrixInstance;
  }

  setBitrixInstance(bitrixInstance: BitrixInstance | null = null) {
    this.bitrixInstance =
      bitrixInstance ||
      new BitrixInstance({
        b24Url: process.env.BITRIX_WEBHOOK_URL!,
        userId: parseInt(process.env.BITRIX_WEBHOOK_USER_ID!),
        secret: process.env.BITRIX_WEBHOOK_SECRET!,
      });

    this.bitrixInstance = this.bitrixInstance.setLog(true);

    return this;
  }
}
