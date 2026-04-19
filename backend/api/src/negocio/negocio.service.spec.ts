import { Test, TestingModule } from '@nestjs/testing';
import { NegocioService } from './negocio.service';

describe('NegocioService', () => {
  let service: NegocioService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [NegocioService],
    }).compile();

    service = module.get<NegocioService>(NegocioService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
