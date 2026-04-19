import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Meta, TipoMeta } from '@prisma/client';

interface CreateMetaInput {
  nome: string;
  tipo: TipoMeta;
  valorAlvo: number;
  dataMeta?: string;
}

@Injectable()
export class MetaService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    const metas = await this.prisma.meta.findMany({
      orderBy: { id: 'asc' },
    });

    const metasComProgresso = await Promise.all(
      metas.map(async (meta) => {
        // soma de todas as transações ligadas a esta meta
        const soma = await this.prisma.transacao.aggregate({
          where: {
            metaId: meta.id,
          },
          _sum: {
            valor: true,
          },
        });

        const valorAcumuladoTransacoes = soma._sum.valor ?? 0;

        const valorAcumulado = valorAcumuladoTransacoes; // se quiser, pode somar meta.valorAcumulado aqui

        const progressoPercentual =
          meta.valorAlvo > 0 ? (valorAcumulado / meta.valorAlvo) * 100 : 0;

        return {
          ...meta,
          valorAcumulado,
          progressoPercentual,
        };
      }),
    );

    return metasComProgresso;
  }

  async create(input: CreateMetaInput): Promise<Meta> {
    const { nome, tipo, valorAlvo, dataMeta } = input;

    return this.prisma.meta.create({
      data: {
        nome,
        tipo,
        valorAlvo,
        dataMeta: dataMeta ? new Date(dataMeta) : null,
      },
    });
  }

  async resumo() {
    const metas = await this.findAll();

    const emAberto = metas.filter((m) => m.ativa && m.progressoPercentual < 100);
    const concluidas = metas.filter(
      (m) => !m.ativa || m.progressoPercentual >= 100,
    );

    return {
      emAberto,
      concluidas,
    };
  }
}