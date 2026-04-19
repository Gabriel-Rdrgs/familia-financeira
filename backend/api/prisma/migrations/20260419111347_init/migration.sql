-- CreateEnum
CREATE TYPE "PapelNaFamilia" AS ENUM ('PAI', 'MAE', 'FILHO', 'FILHA', 'OUTRO');

-- CreateEnum
CREATE TYPE "TipoRenda" AS ENUM ('CLT', 'AUTONOMO', 'ESTAGIARIO', 'APOSENTADO', 'SEM_RENDA');

-- CreateEnum
CREATE TYPE "TipoConta" AS ENUM ('CONTA_CORRENTE', 'CARTEIRA', 'CARTAO_CREDITO', 'POUPANCA', 'CONTA_INVESTIMENTO');

-- CreateEnum
CREATE TYPE "TipoFluxo" AS ENUM ('RECEITA', 'DESPESA', 'AMBOS');

-- CreateEnum
CREATE TYPE "Prioridade" AS ENUM ('ALTA', 'MEDIA', 'BAIXA');

-- CreateEnum
CREATE TYPE "TipoMeta" AS ENUM ('SAUDE', 'DIVIDA', 'RESERVA', 'NEGOCIO', 'LAZER', 'OUTRO');

-- CreateEnum
CREATE TYPE "TipoProdutoInvestimento" AS ENUM ('TESOURO_SELIC', 'CDB_LIQUIDEZ_DIARIA', 'CDB_LONGO_PRAZO', 'TESOURO_IPCA', 'LCI_LCA', 'FUNDO', 'OUTRO');

-- CreateEnum
CREATE TYPE "Liquidez" AS ENUM ('D_PLUS_0', 'D_PLUS_1', 'D_PLUS_30', 'VENCIMENTO');

-- CreateEnum
CREATE TYPE "TipoNegocio" AS ENUM ('LANCHONETE', 'OUTRO');

-- CreateEnum
CREATE TYPE "TipoTransacao" AS ENUM ('RECEITA', 'DESPESA', 'TRANSFERENCIA');

-- CreateEnum
CREATE TYPE "FormaPagamento" AS ENUM ('DINHEIRO', 'DEBITO', 'CREDITO', 'PIX', 'BOLETO', 'OUTRO');

-- CreateTable
CREATE TABLE "Pessoa" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "papelNaFamilia" "PapelNaFamilia" NOT NULL,
    "tipoRendaPrincipal" "TipoRenda" NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Pessoa_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContaFinanceira" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "tipo" "TipoConta" NOT NULL,
    "limite" DOUBLE PRECISION,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "titularPessoaId" INTEGER,

    CONSTRAINT "ContaFinanceira_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Categoria" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "tipoFluxo" "TipoFluxo" NOT NULL,
    "prioridade" "Prioridade" NOT NULL,

    CONSTRAINT "Categoria_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Subcategoria" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "categoriaId" INTEGER NOT NULL,

    CONSTRAINT "Subcategoria_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Meta" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "tipo" "TipoMeta" NOT NULL,
    "valorAlvo" DOUBLE PRECISION NOT NULL,
    "valorAcumulado" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "dataInicio" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dataMeta" TIMESTAMP(3),
    "ativa" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Meta_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Investimento" (
    "id" SERIAL NOT NULL,
    "tipoProduto" "TipoProdutoInvestimento" NOT NULL,
    "instituicao" TEXT NOT NULL,
    "dataAplicacao" TIMESTAMP(3) NOT NULL,
    "valorAplicado" DOUBLE PRECISION NOT NULL,
    "valorAtual" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "liquidez" "Liquidez" NOT NULL,
    "metaId" INTEGER,
    "contaInvestimentoId" INTEGER NOT NULL,

    CONSTRAINT "Investimento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Negocio" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "tipo" "TipoNegocio" NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "descricao" TEXT,
    "dataInicioPrevista" TIMESTAMP(3),
    "dataInicioReal" TIMESTAMP(3),

    CONSTRAINT "Negocio_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Transacao" (
    "id" SERIAL NOT NULL,
    "data" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "tipo" "TipoTransacao" NOT NULL,
    "valor" DOUBLE PRECISION NOT NULL,
    "descricao" TEXT,
    "contaOrigemId" INTEGER,
    "contaDestinoId" INTEGER,
    "categoriaId" INTEGER NOT NULL,
    "subcategoriaId" INTEGER,
    "pessoaResponsavelId" INTEGER,
    "metaId" INTEGER,
    "negocioId" INTEGER,
    "relacionadoAoNegocio" BOOLEAN NOT NULL DEFAULT false,
    "formaPagamento" "FormaPagamento" NOT NULL,

    CONSTRAINT "Transacao_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ContaFinanceira" ADD CONSTRAINT "ContaFinanceira_titularPessoaId_fkey" FOREIGN KEY ("titularPessoaId") REFERENCES "Pessoa"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subcategoria" ADD CONSTRAINT "Subcategoria_categoriaId_fkey" FOREIGN KEY ("categoriaId") REFERENCES "Categoria"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Investimento" ADD CONSTRAINT "Investimento_metaId_fkey" FOREIGN KEY ("metaId") REFERENCES "Meta"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Investimento" ADD CONSTRAINT "Investimento_contaInvestimentoId_fkey" FOREIGN KEY ("contaInvestimentoId") REFERENCES "ContaFinanceira"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transacao" ADD CONSTRAINT "Transacao_contaOrigemId_fkey" FOREIGN KEY ("contaOrigemId") REFERENCES "ContaFinanceira"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transacao" ADD CONSTRAINT "Transacao_contaDestinoId_fkey" FOREIGN KEY ("contaDestinoId") REFERENCES "ContaFinanceira"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transacao" ADD CONSTRAINT "Transacao_categoriaId_fkey" FOREIGN KEY ("categoriaId") REFERENCES "Categoria"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transacao" ADD CONSTRAINT "Transacao_subcategoriaId_fkey" FOREIGN KEY ("subcategoriaId") REFERENCES "Subcategoria"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transacao" ADD CONSTRAINT "Transacao_pessoaResponsavelId_fkey" FOREIGN KEY ("pessoaResponsavelId") REFERENCES "Pessoa"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transacao" ADD CONSTRAINT "Transacao_metaId_fkey" FOREIGN KEY ("metaId") REFERENCES "Meta"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transacao" ADD CONSTRAINT "Transacao_negocioId_fkey" FOREIGN KEY ("negocioId") REFERENCES "Negocio"("id") ON DELETE SET NULL ON UPDATE CASCADE;
