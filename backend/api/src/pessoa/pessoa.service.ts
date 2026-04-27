// backend/api/src/pessoa/pessoa.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PapelNaFamilia, Pessoa, TipoRenda } from '@prisma/client';

interface CreatePessoaInput {
  nome: string;
  papelNaFamilia: PapelNaFamilia;
  tipoRendaPrincipal: TipoRenda;
}

interface UpdatePessoaInput {
  nome?: string;
  papelNaFamilia?: PapelNaFamilia;
  tipoRendaPrincipal?: TipoRenda;
  ativo?: boolean;
}

@Injectable()
export class PessoaService {
  constructor(private prisma: PrismaService) {}

  findAll(): Promise<Pessoa[]> {
    return this.prisma.pessoa.findMany({ orderBy: { id: 'asc' } });
  }

  findOne(id: number): Promise<Pessoa | null> {
    return this.prisma.pessoa.findUnique({ where: { id } });
  }

  create(input: CreatePessoaInput): Promise<Pessoa> {
    // Aqui garantimos que todos os campos obrigatórios do schema sejam passados:
    return this.prisma.pessoa.create({
      data: {
        nome: input.nome,
        papelNaFamilia: input.papelNaFamilia,
        tipoRendaPrincipal: input.tipoRendaPrincipal,
        ativo: true,
      },
    });
  }

  async update(id: number, input: UpdatePessoaInput): Promise<Pessoa> {
    const existe = await this.prisma.pessoa.findUnique({ where: { id } });
    if (!existe) throw new NotFoundException(`Pessoa #${id} não encontrada`);

    return this.prisma.pessoa.update({
      where: { id },
      data: {
        nome: input.nome ?? existe.nome,
        papelNaFamilia: input.papelNaFamilia ?? existe.papelNaFamilia,
        tipoRendaPrincipal:
          input.tipoRendaPrincipal ?? existe.tipoRendaPrincipal,
        ativo: input.ativo ?? existe.ativo,
      },
    });
  }

  async delete(id: number): Promise<void> {
    const existe = await this.prisma.pessoa.findUnique({ where: { id } });
    if (!existe) throw new NotFoundException(`Pessoa #${id} não encontrada`);
    await this.prisma.pessoa.delete({ where: { id } });
  }
}