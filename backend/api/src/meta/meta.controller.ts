// backend/api/src/meta/meta.controller.ts
import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { MetaService } from './meta.service';
import { TipoMeta } from '@prisma/client';

class CreateMetaDto {
  nome: string;
  tipo: TipoMeta;
  valorAlvo: number;
  dataMeta?: string;
}

class UpdateMetaDto {
  nome?: string;
  tipo?: TipoMeta;
  valorAlvo?: number;
  dataMeta?: string;
  ativa?: boolean;
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

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateMetaDto,
  ) {
    return this.metaService.update(id, body);
  }
}