import { Body, Controller, Get, Post } from '@nestjs/common';
import { MetaService } from './meta.service';
import { TipoMeta } from '@prisma/client';

class CreateMetaDto {
  nome: string;
  tipo: TipoMeta;
  valorAlvo: number;
  dataMeta?: string; // ISO string opcional
}

@Controller('metas')
export class MetaController {
  constructor(private readonly metaService: MetaService) {}

  @Get()
  findAll() {
    return this.metaService.findAll();
  }

  @Get('resumo')
  resumo() {
    return this.metaService.resumo();
  }

  @Post()
  create(@Body() body: CreateMetaDto) {
    return this.metaService.create(body);
  }
}