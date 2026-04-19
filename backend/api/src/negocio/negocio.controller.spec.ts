import { Test, TestingModule } from '@nestjs/testing';
import { NegocioController } from './negocio.controller';

describe('NegocioController', () => {
  let controller: NegocioController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NegocioController],
    }).compile();

    controller = module.get<NegocioController>(NegocioController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
