import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  Transacao,
  TipoTransacao,
  FormaPagamento,
} from '@prisma/client';

interface CreateTransacaoInput {
  data?: Date;
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

@Injectable()
export class TransacaoService {
  constructor(private prisma: PrismaService) {}

  findAll(): Promise<Transacao[]> {
    return this.prisma.transacao.findMany({
      orderBy: { data: 'desc' },
    });
  }

  findByMonth(year: number, month: number): Promise<Transacao[]> {
    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 0, 23, 59, 59, 999);

    return this.prisma.transacao.findMany({
      where: {
        data: {
          gte: start,
          lte: end,
        },
      },
      orderBy: { data: 'desc' },
    });
  }

  create(input: CreateTransacaoInput): Promise<Transacao> {
    const {
      data,
      tipo,
      valor,
      descricao,
      pessoaResponsavelId,
      categoriaId,
      subcategoriaId,
      formaPagamento,
      relacionadoAoNegocio,
      contaOrigemId,
      contaDestinoId,
      metaId,
      negocioId,
    } = input;

    return this.prisma.transacao.create({
      data: {
        data: data ?? new Date(),
        tipo,
        valor,
        descricao,
        pessoaResponsavelId,
        categoriaId,
        subcategoriaId,
        formaPagamento,
        relacionadoAoNegocio: relacionadoAoNegocio ?? false,
        contaOrigemId,
        contaDestinoId,
        metaId,
        negocioId,
      },
    });
  }
}