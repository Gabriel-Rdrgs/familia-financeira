import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { TransacaoService } from './transacao.service';
import { FormaPagamento, TipoTransacao } from '@prisma/client';

class CreateTransacaoDto {
  data?: string; // ISO string opcional
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
}