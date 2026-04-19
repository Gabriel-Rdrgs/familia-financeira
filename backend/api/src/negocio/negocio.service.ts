import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Negocio, TipoNegocio, TipoTransacao } from '@prisma/client';

interface CreateNegocioInput {
  nome: string;
  tipo: TipoNegocio;
  descricao?: string;
  dataInicioPrevista?: string;
}

@Injectable()
export class NegocioService {
  constructor(private prisma: PrismaService) {}

  findAll(): Promise<Negocio[]> {
    return this.prisma.negocio.findMany({
      orderBy: { id: 'asc' },
    });
  }

  findOne(id: number): Promise<Negocio | null> {
    return this.prisma.negocio.findUnique({
      where: { id },
    });
  }

  create(input: CreateNegocioInput): Promise<Negocio> {
    const { nome, tipo, descricao, dataInicioPrevista } = input;

    return this.prisma.negocio.create({
      data: {
        nome,
        tipo,
        descricao,
        dataInicioPrevista: dataInicioPrevista
          ? new Date(dataInicioPrevista)
          : null,
      },
    });
  }

  async resumoMensal(id: number, ano: number, mes: number) {
    const inicio = new Date(ano, mes - 1, 1);
    const fim = new Date(ano, mes, 0, 23, 59, 59, 999);

    const transacoesNegocio = await this.prisma.transacao.findMany({
      where: {
        negocioId: id,
        data: {
          gte: inicio,
          lte: fim,
        },
      },
    });

    let receitas = 0;
    let despesas = 0;

    for (const t of transacoesNegocio) {
      if (t.tipo === TipoTransacao.RECEITA) {
        receitas += t.valor;
      } else if (t.tipo === TipoTransacao.DESPESA) {
        despesas += t.valor;
      }
    }

    const lucro = receitas - despesas;

    return {
      negocioId: id,
      ano,
      mes,
      receitas,
      despesas,
      lucro,
      margemPercentual: receitas > 0 ? (lucro / receitas) * 100 : 0,
      quantidadeTransacoes: transacoesNegocio.length,
    };
  }
}