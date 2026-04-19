import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Categoria, Subcategoria } from '@prisma/client';

@Injectable()
export class CategoriaService {
  constructor(private prisma: PrismaService) {}

  findAll(): Promise<(Categoria & { subcategorias: Subcategoria[] })[]> {
    return this.prisma.categoria.findMany({
      include: {
        subcategorias: true,
      },
      orderBy: {
        id: 'asc',
      },
    });
  }

  async seedDefaults() {
    // evita duplicar se já existe
    const count = await this.prisma.categoria.count();
    if (count > 0) return;

    // Cria categorias padrão com subcategorias
    await this.prisma.categoria.create({
      data: {
        nome: 'ESSENCIAIS',
        tipoFluxo: 'DESPESA',
        prioridade: 'ALTA',
        subcategorias: {
          create: [
            { nome: 'Aluguel' },
            { nome: 'Água' },
            { nome: 'Luz' },
            { nome: 'Internet' },
            { nome: 'Alimentação mercado' },
            { nome: 'Transporte pai' },
          ],
        },
      },
    });

    await this.prisma.categoria.create({
      data: {
        nome: 'DÍVIDAS',
        tipoFluxo: 'DESPESA',
        prioridade: 'ALTA',
        subcategorias: {
          create: [
            { nome: 'Empréstimos informais' },
            { nome: 'Serasa' },
            { nome: 'Cartão de crédito' },
          ],
        },
      },
    });

    await this.prisma.categoria.create({
      data: {
        nome: 'SAÚDE',
        tipoFluxo: 'DESPESA',
        prioridade: 'ALTA',
        subcategorias: {
          create: [
            { nome: 'Lentes Gabriel' },
            { nome: 'Consultas' },
            { nome: 'Exames' },
            { nome: 'Medicamentos' },
          ],
        },
      },
    });

    await this.prisma.categoria.create({
      data: {
        nome: 'LAZER',
        tipoFluxo: 'DESPESA',
        prioridade: 'MEDIA',
        subcategorias: {
          create: [
            { nome: 'Streaming' },
            { nome: 'Passeios' },
            { nome: 'Viagens' },
          ],
        },
      },
    });

    await this.prisma.categoria.create({
      data: {
        nome: 'NEGÓCIO',
        tipoFluxo: 'DESPESA',
        prioridade: 'ALTA',
        subcategorias: {
          create: [
            { nome: 'Insumos lanchonete' },
            { nome: 'Aluguel ponto' },
            { nome: 'Gás' },
            { nome: 'Embalagens' },
          ],
        },
      },
    });

    await this.prisma.categoria.create({
      data: {
        nome: 'INVESTIMENTOS',
        tipoFluxo: 'DESPESA',
        prioridade: 'MEDIA',
        subcategorias: {
          create: [
            { nome: 'Reserva emergência' },
            { nome: 'Tesouro Selic' },
            { nome: 'CDB liquidez diária' },
          ],
        },
      },
    });
  }
}