-- CreateEnum
CREATE TYPE "NetworkBrandStatus" AS ENUM ('ACTIVE', 'INACTIVE');

-- CreateEnum
CREATE TYPE "IssuerStatus" AS ENUM ('ACTIVE', 'SUSPENDED', 'INACTIVE');

-- CreateEnum
CREATE TYPE "BINRangeStatus" AS ENUM ('ACTIVE', 'INACTIVE');

-- CreateTable
CREATE TABLE "FinancialNetwork" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FinancialNetwork_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NetworkBrand" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "status" "NetworkBrandStatus" NOT NULL DEFAULT 'ACTIVE',
    "networkId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NetworkBrand_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Issuer" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "status" "IssuerStatus" NOT NULL DEFAULT 'ACTIVE',
    "networkId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Issuer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BINRange" (
    "id" SERIAL NOT NULL,
    "start" TEXT NOT NULL,
    "end" TEXT NOT NULL,
    "length" INTEGER NOT NULL,
    "status" "BINRangeStatus" NOT NULL DEFAULT 'ACTIVE',
    "networkId" INTEGER NOT NULL,
    "brandId" INTEGER NOT NULL,
    "issuerId" INTEGER NOT NULL,
    "country" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BINRange_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "FinancialNetwork_name_key" ON "FinancialNetwork"("name");

-- CreateIndex
CREATE UNIQUE INDEX "FinancialNetwork_code_key" ON "FinancialNetwork"("code");

-- CreateIndex
CREATE UNIQUE INDEX "NetworkBrand_code_key" ON "NetworkBrand"("code");

-- CreateIndex
CREATE INDEX "NetworkBrand_networkId_idx" ON "NetworkBrand"("networkId");

-- CreateIndex
CREATE UNIQUE INDEX "Issuer_code_key" ON "Issuer"("code");

-- CreateIndex
CREATE INDEX "Issuer_networkId_idx" ON "Issuer"("networkId");

-- CreateIndex
CREATE INDEX "BINRange_networkId_idx" ON "BINRange"("networkId");

-- CreateIndex
CREATE INDEX "BINRange_brandId_idx" ON "BINRange"("brandId");

-- CreateIndex
CREATE INDEX "BINRange_issuerId_idx" ON "BINRange"("issuerId");

-- CreateIndex
CREATE INDEX "BINRange_start_idx" ON "BINRange"("start");

-- CreateIndex
CREATE INDEX "BINRange_end_idx" ON "BINRange"("end");

-- AddForeignKey
ALTER TABLE "NetworkBrand" ADD CONSTRAINT "NetworkBrand_networkId_fkey" FOREIGN KEY ("networkId") REFERENCES "FinancialNetwork"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Issuer" ADD CONSTRAINT "Issuer_networkId_fkey" FOREIGN KEY ("networkId") REFERENCES "FinancialNetwork"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BINRange" ADD CONSTRAINT "BINRange_networkId_fkey" FOREIGN KEY ("networkId") REFERENCES "FinancialNetwork"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BINRange" ADD CONSTRAINT "BINRange_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "NetworkBrand"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BINRange" ADD CONSTRAINT "BINRange_issuerId_fkey" FOREIGN KEY ("issuerId") REFERENCES "Issuer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
