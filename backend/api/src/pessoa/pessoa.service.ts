// backend/api/src/pessoa/pessoa.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Pessoa } from '@prisma/client';

interface CreatePessoaInput {
  nome: string;
  email?: string;
  papel?: string; // ADMIN | MEMBRO | VISUALIZADOR
  cor?: string;   // cor de identificação visual
}

interface UpdatePessoaInput {
  nome?: string;
  email?: string;
  papel?: string;
  cor?: string;
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
    return this.prisma.pessoa.create({ data: input });
  }

  async update(id: number, input: UpdatePessoaInput): Promise<Pessoa> {
    const existe = await this.prisma.pessoa.findUnique({ where: { id } });
    if (!existe) throw new NotFoundException(`Pessoa #${id} não encontrada`);
    return this.prisma.pessoa.update({ where: { id }, data: input });
  }

  async delete(id: number): Promise<void> {
    const existe = await this.prisma.pessoa.findUnique({ where: { id } });
    if (!existe) throw new NotFoundException(`Pessoa #${id} não encontrada`);
    await this.prisma.pessoa.delete({ where: { id } });
  }
}