// backend/api/src/negocio/negocio.controller.ts
import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { NegocioService } from './negocio.service';
import { TipoNegocio } from '@prisma/client';

class CreateNegocioDto {
  nome: string;
  tipo: TipoNegocio;
  descricao?: string;
  dataInicioPrevista?: string;
}

class UpdateNegocioDto {
  nome?: string;
  tipo?: TipoNegocio;
  descricao?: string;
  dataInicioPrevista?: string;
  dataInicioReal?: string;
  ativo?: boolean;
}

@Controller('negocios')
export class NegocioController {
  constructor(private readonly negocioService: NegocioService) {}

  @Get()
  findAll() {
    return this.negocioService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.negocioService.findOne(id);
  }

  @Post()
  create(@Body() body: CreateNegocioDto) {
    return this.negocioService.create(body);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateNegocioDto,
  ) {
    return this.negocioService.update(id, body);
  }

  @Get(':id/mensal')
  resumoMensal(
    @Param('id', ParseIntPipe) id: number,
    @Query('ano', ParseIntPipe) ano: number,
    @Query('mes', ParseIntPipe) mes: number,
  ) {
    return this.negocioService.resumoMensal(id, ano, mes);
  }
}