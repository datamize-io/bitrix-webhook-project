import { Test, TestingModule } from '@nestjs/testing';
import { BitrixLibService } from './bitrix-lib.service';

describe('BitrixLibService', () => {
  let service: BitrixLibService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BitrixLibService],
    }).compile();

    service = module.get<BitrixLibService>(BitrixLibService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
