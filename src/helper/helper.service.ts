import { Injectable } from '@nestjs/common';

@Injectable()
export class HelperService {
  // Util que pega variação dos mesmos números
  static getAllVariationsOfSamePhones(phones: string[]): Array<string> {
    console.log('Verificando os números');

    const result = new Set(phones.map((p) => String(p).replace('+', '')));

    [...result].forEach((phone: string) => {
      if (!phone.startsWith('55') && phone.length < 10) return;
      if (!phone.startsWith('55') && (phone.length === 10 || phone.length === 11)) {
        phone = '55' + phone;
      }

      // Sem o 9 após o DDD
      if (phone.length === 12) {
        const withNine = phone.slice(0, 4) + '9' + phone.slice(4);
        result.add(withNine);
      }

      // Com o 9, remover para criar variação
      if (phone.length === 13 && phone[4] === '9') {
        const withoutNine = phone.slice(0, 4) + phone.slice(5);
        result.add(withoutNine);
      }
    });

    return Array.from(result);
  }
}
