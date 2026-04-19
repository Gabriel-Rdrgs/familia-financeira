import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { PessoaModule } from './pessoa/pessoa.module';
import { CategoriaModule } from './categoria/categoria.module';
import { TransacaoModule } from './transacao/transacao.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { MetaModule } from './meta/meta.module';
import { NegocioModule } from './negocio/negocio.module';

@Module({
  imports: [
    PrismaModule,
    PessoaModule,
    CategoriaModule,
    TransacaoModule,
    DashboardModule,
    MetaModule,
    NegocioModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}