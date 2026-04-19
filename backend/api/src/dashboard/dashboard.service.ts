import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TipoTransacao } from '@prisma/client';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getMensal(ano: number, mes: number) {
    const inicio = new Date(ano, mes - 1, 1);
    const fim = new Date(ano, mes, 0, 23, 59, 59, 999);

    const transacoes = await this.prisma.transacao.findMany({
      where: {
        data: {
          gte: inicio,
          lte: fim,
        },
      },
      include: {
        categoria: true,
      },
    });

    if (transacoes.length === 0) {
      return {
        ano,
        mes,
        totalReceitas: 0,
        totalDespesas: 0,
        saldo: 0,
        porCategoria: [],
        pilares: {
          essenciais: { total: 0, percentualDaReceita: 0 },
          dividas: { total: 0, percentualDaReceita: 0 },
          saude: { total: 0, percentualDaReceita: 0 },
          lazer: { total: 0, percentualDaReceita: 0 },
          negocio: { total: 0, percentualDaReceita: 0 },
          investimentos: { total: 0, percentualDaReceita: 0 },
        },
        limites: {
          essenciaisMaisSaude: {
            limitePercentual: 50,
            usadoPercentual: 0,
            dentroDoLimite: true,
          },
          lazer: {
            limitePercentual: 15,
            usadoPercentual: 0,
            dentroDoLimite: true,
          },
          prioridades: {
            minimoRecomendadoPercentual: 20,
            usadoPercentual: 0,
            atingiuMinimo: false,
          },
        },
      };
    }

    let totalReceitas = 0;
    let totalDespesas = 0;

    for (const t of transacoes) {
      if (t.tipo === TipoTransacao.RECEITA) {
        totalReceitas += t.valor;
      } else if (t.tipo === TipoTransacao.DESPESA) {
        totalDespesas += t.valor;
      }
    }

    const saldo = totalReceitas - totalDespesas;

    const mapaPorCategoria = new Map<
      number,
      { nome: string; total: number }
    >();

    for (const t of transacoes) {
      if (t.tipo !== TipoTransacao.DESPESA) continue;

      const catId = t.categoriaId;
      const catNome = t.categoria?.nome ?? 'SEM_CATEGORIA';

      const atual = mapaPorCategoria.get(catId) ?? { nome: catNome, total: 0 };
      atual.total += t.valor;
      mapaPorCategoria.set(catId, atual);
    }

    const porCategoria = Array.from(mapaPorCategoria.entries()).map(
      ([categoriaId, { nome, total }]) => ({
        categoriaId,
        nome,
        total,
        percentualDaReceita:
          totalReceitas > 0 ? (total / totalReceitas) * 100 : 0,
      }),
    );

    // Agregação por pilar
    let totalEssenciais = 0;
    let totalDividas = 0;
    let totalSaude = 0;
    let totalLazer = 0;
    let totalNegocio = 0;
    let totalInvestimentos = 0;

    for (const cat of porCategoria) {
      const nome = cat.nome.toUpperCase();

      if (nome === 'ESSENCIAIS') {
        totalEssenciais += cat.total;
      } else if (nome === 'DÍVIDAS' || nome === 'DIVIDAS') {
        totalDividas += cat.total;
      } else if (nome === 'SAÚDE' || nome === 'SAUDE') {
        totalSaude += cat.total;
      } else if (nome === 'LAZER') {
        totalLazer += cat.total;
      } else if (nome === 'NEGÓCIO' || nome === 'NEGOCIO') {
        totalNegocio += cat.total;
      } else if (nome === 'INVESTIMENTOS') {
        totalInvestimentos += cat.total;
      }
    }

    const pilares = {
      essenciais: {
        total: totalEssenciais,
        percentualDaReceita:
          totalReceitas > 0 ? (totalEssenciais / totalReceitas) * 100 : 0,
      },
      dividas: {
        total: totalDividas,
        percentualDaReceita:
          totalReceitas > 0 ? (totalDividas / totalReceitas) * 100 : 0,
      },
      saude: {
        total: totalSaude,
        percentualDaReceita:
          totalReceitas > 0 ? (totalSaude / totalReceitas) * 100 : 0,
      },
      lazer: {
        total: totalLazer,
        percentualDaReceita:
          totalReceitas > 0 ? (totalLazer / totalReceitas) * 100 : 0,
      },
      negocio: {
        total: totalNegocio,
        percentualDaReceita:
          totalReceitas > 0 ? (totalNegocio / totalReceitas) * 100 : 0,
      },
      investimentos: {
        total: totalInvestimentos,
        percentualDaReceita:
          totalReceitas > 0
            ? (totalInvestimentos / totalReceitas) * 100
            : 0,
      },
    };

    // Cálculo dos limites
    const essenciaisMaisSaudeTotal = totalEssenciais + totalSaude;
    const essenciaisMaisSaudePercentual =
      totalReceitas > 0 ? (essenciaisMaisSaudeTotal / totalReceitas) * 100 : 0;

    const prioridadesTotal =
      totalDividas + totalInvestimentos + totalNegocio;
    const prioridadesPercentual =
      totalReceitas > 0 ? (prioridadesTotal / totalReceitas) * 100 : 0;

    const lazerPercentual =
      totalReceitas > 0 ? (totalLazer / totalReceitas) * 100 : 0;

    const limites = {
      essenciaisMaisSaude: {
        limitePercentual: 50,
        usadoPercentual: essenciaisMaisSaudePercentual,
        dentroDoLimite: essenciaisMaisSaudePercentual <= 50,
      },
      lazer: {
        limitePercentual: 15,
        usadoPercentual: lazerPercentual,
        dentroDoLimite: lazerPercentual <= 15,
      },
      prioridades: {
        minimoRecomendadoPercentual: 20,
        usadoPercentual: prioridadesPercentual,
        atingiuMinimo: prioridadesPercentual >= 20,
      },
    };

    return {
      ano,
      mes,
      totalReceitas,
      totalDespesas,
      saldo,
      porCategoria,
      pilares,
      limites,
    };
  }
}