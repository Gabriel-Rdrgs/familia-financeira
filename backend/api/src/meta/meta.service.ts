// backend/api/src/meta/meta.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Meta, TipoMeta } from '@prisma/client';

interface CreateMetaInput {
  nome: string;
  tipo: TipoMeta;
  valorAlvo: number;
  dataMeta?: string;
}

interface UpdateMetaInput {
  nome?: string;
  tipo?: TipoMeta;
  valorAlvo?: number;
  dataMeta?: string;
  ativa?: boolean;
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
        const soma = await this.prisma.transacao.aggregate({
          where: { metaId: meta.id },
          _sum: { valor: true },
        });

        const valorAcumulado = soma._sum.valor ?? 0;
        const progressoPercentual =
          meta.valorAlvo > 0 ? (valorAcumulado / meta.valorAlvo) * 100 : 0;

        return { ...meta, valorAcumulado, progressoPercentual };
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

  async update(id: number, input: UpdateMetaInput): Promise<Meta> {
    const existe = await this.prisma.meta.findUnique({ where: { id } });
    if (!existe) throw new NotFoundException(`Meta #${id} não encontrada`);

    const { dataMeta, ...rest } = input;
    return this.prisma.meta.update({
      where: { id },
      data: {
        ...rest,
        ...(dataMeta !== undefined ? { dataMeta: new Date(dataMeta) } : {}),
      },
    });
  }

  async resumo() {
    const metas = await this.findAll();
    const emAberto = metas.filter((m) => m.ativa && m.progressoPercentual < 100);
    const concluidas = metas.filter((m) => !m.ativa || m.progressoPercentual >= 100);
    return { emAberto, concluidas };
  }
}