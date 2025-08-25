import { Injectable } from '@nestjs/common';
import { PhoneHelper } from '@datamize-io/bitrix-lib-node';

@Injectable()
export class HelperService {
  // Util que pega variação dos mesmos números
  static getAllVariationsOfSamePhones(phones: string[]): Array<string> {
    return PhoneHelper.getAllVariationsOfSamePhones(phones);
  }
}
