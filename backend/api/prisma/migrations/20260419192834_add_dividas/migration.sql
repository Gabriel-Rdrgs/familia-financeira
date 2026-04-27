/*
  Warnings:

  - You are about to drop the `Transacao` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "StatusDivida" AS ENUM ('ATIVA', 'QUITADA', 'RENEGOCIADA', 'SUSPENSA');

-- CreateEnum
CREATE TYPE "StatusParcela" AS ENUM ('PENDENTE', 'PAGA', 'ATRASADA', 'IGNORADA');

-- DropForeignKey
ALTER TABLE "public"."Transacao" DROP CONSTRAINT "Transacao_categoriaId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Transacao" DROP CONSTRAINT "Transacao_contaDestinoId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Transacao" DROP CONSTRAINT "Transacao_contaOrigemId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Transacao" DROP CONSTRAINT "Transacao_metaId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Transacao" DROP CONSTRAINT "Transacao_negocioId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Transacao" DROP CONSTRAINT "Transacao_pessoaResponsavelId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Transacao" DROP CONSTRAINT "Transacao_subcategoriaId_fkey";

-- DropTable
DROP TABLE "public"."Transacao";

-- CreateTable
CREATE TABLE "Divida" (
    "id" SERIAL NOT NULL,
    "credor" TEXT NOT NULL,
    "descricao" TEXT,
    "valorOriginal" DOUBLE PRECISION NOT NULL,
    "valorNegociado" DOUBLE PRECISION NOT NULL,
    "totalParcelas" INTEGER NOT NULL,
    "valorParcela" DOUBLE PRECISION NOT NULL,
    "diaVencimento" INTEGER NOT NULL,
    "dataInicio" TIMESTAMP(3) NOT NULL,
    "status" "StatusDivida" NOT NULL DEFAULT 'ATIVA',
    "pessoaId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Divida_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ParcelaDivida" (
    "id" SERIAL NOT NULL,
    "numeroParcela" INTEGER NOT NULL,
    "dataVencimento" TIMESTAMP(3) NOT NULL,
    "valorPrevisto" DOUBLE PRECISION NOT NULL,
    "valorPago" DOUBLE PRECISION,
    "dataPagamento" TIMESTAMP(3),
    "status" "StatusParcela" NOT NULL DEFAULT 'PENDENTE',
    "observacao" TEXT,
    "dividaId" INTEGER NOT NULL,
    "transacaoId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ParcelaDivida_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ParcelaDivida_transacaoId_key" ON "ParcelaDivida"("transacaoId");

-- AddForeignKey
ALTER TABLE "Divida" ADD CONSTRAINT "Divida_pessoaId_fkey" FOREIGN KEY ("pessoaId") REFERENCES "Pessoa"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ParcelaDivida" ADD CONSTRAINT "ParcelaDivida_dividaId_fkey" FOREIGN KEY ("dividaId") REFERENCES "Divida"("id") ON DELETE CASCADE ON UPDATE CASCADE;
