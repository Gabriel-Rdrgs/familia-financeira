import { Module } from '@nestjs/common';
import { NegocioService } from './negocio.service';
import { NegocioController } from './negocio.controller';

@Module({
  providers: [NegocioService],
  controllers: [NegocioController]
})
export class NegocioModule {}
