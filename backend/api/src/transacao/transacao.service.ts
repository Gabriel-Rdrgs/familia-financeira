// backend/api/src/transacao/transacao.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { FormaPagamento, Transacao, TipoTransacao } from '@prisma/client';

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

type UpdateTransacaoInput = Partial<CreateTransacaoInput>;

@Injectable()
export class TransacaoService {
  constructor(private prisma: PrismaService) {}

  findAll(): Promise<Transacao[]> {
    return this.prisma.transacao.findMany({ orderBy: { data: 'desc' } });
  }

  findByMonth(year: number, month: number): Promise<Transacao[]> {
    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 0, 23, 59, 59, 999);

    return this.prisma.transacao.findMany({
      where: { data: { gte: start, lte: end } },
      include: {
        categoria: true,
        subcategoria: true,
        pessoaResponsavel: true,
      },
      orderBy: { data: 'desc' },
    });
  }

  create(input: CreateTransacaoInput): Promise<Transacao> {
    const { data, ...rest } = input;
    return this.prisma.transacao.create({
      data: {
        ...rest,
        data: data ?? new Date(),
        relacionadoAoNegocio: input.relacionadoAoNegocio ?? false,
      },
    });
  }

  async update(id: number, input: UpdateTransacaoInput): Promise<Transacao> {
    const existe = await this.prisma.transacao.findUnique({ where: { id } });
    if (!existe) throw new NotFoundException(`Transação #${id} não encontrada`);

    const { data, ...rest } = input;
    return this.prisma.transacao.update({
      where: { id },
      data: {
        ...rest,
        ...(data !== undefined ? { data } : {}),
      },
    });
  }

  async remove(id: number): Promise<void> {
    const existe = await this.prisma.transacao.findUnique({ where: { id } });
    if (!existe) throw new NotFoundException(`Transação #${id} não encontrada`);
    await this.prisma.transacao.delete({ where: { id } });
  }
}