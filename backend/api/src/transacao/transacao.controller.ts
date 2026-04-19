// backend/api/src/transacao/transacao.controller.ts
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { TransacaoService } from './transacao.service';
import { FormaPagamento, TipoTransacao } from '@prisma/client';

class CreateTransacaoDto {
  data?: string;
  tipo: TipoTransacao;
  valor: number;
  descricao?: string;
  pessoaResponsavelId?: number;
  categoriaId: number;
  subcategoriaId?: number;
  formaPagamento: FormaPagamento;
  relacionadoAoNegocio?: boolean;
  contaOrigemId?: number;
  contaDestinoId?: number;
  metaId?: number;
  negocioId?: number;
}

class UpdateTransacaoDto {
  data?: string;
  tipo?: TipoTransacao;
  valor?: number;
  descricao?: string;
  pessoaResponsavelId?: number;
  categoriaId?: number;
  subcategoriaId?: number;
  formaPagamento?: FormaPagamento;
  relacionadoAoNegocio?: boolean;
  contaOrigemId?: number;
  contaDestinoId?: number;
  metaId?: number;
  negocioId?: number;
}

@Controller('transacoes')
export class TransacaoController {
  constructor(private readonly transacaoService: TransacaoService) {}

  @Get()
  findAll(
    @Query('ano', ParseIntPipe) ano: number,
    @Query('mes', ParseIntPipe) mes: number,
  ) {
    return this.transacaoService.findByMonth(ano, mes);
  }

  @Post()
  create(@Body() body: CreateTransacaoDto) {
    const { data, ...rest } = body;
    return this.transacaoService.create({
      ...rest,
      data: data ? new Date(data) : undefined,
    });
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateTransacaoDto,
  ) {
    const { data, ...rest } = body;
    return this.transacaoService.update(id, {
      ...rest,
      data: data ? new Date(data) : undefined,
    });
  }

  @Delete(':id')
  @HttpCode(204)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.transacaoService.remove(id);
  }
}