import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma, Pessoa } from '@prisma/client';

@Injectable()
export class PessoaService {
  constructor(private prisma: PrismaService) {}

  findAll(): Promise<Pessoa[]> {
    return this.prisma.pessoa.findMany();
  }

  findOne(id: number): Promise<Pessoa | null> {
    return this.prisma.pessoa.findUnique({
      where: { id },
    });
  }

  create(data: Prisma.PessoaCreateInput): Promise<Pessoa> {
    return this.prisma.pessoa.create({
      data,
    });
  }

  update(id: number, data: Prisma.PessoaUpdateInput): Promise<Pessoa> {
    return this.prisma.pessoa.update({
      where: { id },
      data,
    });
  }

  remove(id: number): Promise<Pessoa> {
    return this.prisma.pessoa.delete({
      where: { id },
    });
  }
}