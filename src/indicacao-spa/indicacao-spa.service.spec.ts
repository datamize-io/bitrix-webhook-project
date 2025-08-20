import { Test, TestingModule } from '@nestjs/testing';
import { IndicacaoSpaService } from './indicacao-spa.service';

describe('IndicacaoSpaService', () => {
  let service: IndicacaoSpaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [IndicacaoSpaService],
    }).compile();

    service = module.get<IndicacaoSpaService>(IndicacaoSpaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
