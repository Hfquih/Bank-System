-- CreateEnum
CREATE TYPE "NetworkTokenStatus" AS ENUM ('ACTIVE', 'SUSPENDED', 'INACTIVE');

-- CreateTable
CREATE TABLE "NetworkToken" (
    "id" SERIAL NOT NULL,
    "token" TEXT NOT NULL,
    "networkId" INTEGER NOT NULL,
    "issuerId" INTEGER NOT NULL,
    "status" "NetworkTokenStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NetworkToken_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "NetworkToken_token_key" ON "NetworkToken"("token");

-- CreateIndex
CREATE INDEX "NetworkToken_networkId_idx" ON "NetworkToken"("networkId");

-- CreateIndex
CREATE INDEX "NetworkToken_issuerId_idx" ON "NetworkToken"("issuerId");

-- AddForeignKey
ALTER TABLE "NetworkToken" ADD CONSTRAINT "NetworkToken_networkId_fkey" FOREIGN KEY ("networkId") REFERENCES "FinancialNetwork"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NetworkToken" ADD CONSTRAINT "NetworkToken_issuerId_fkey" FOREIGN KEY ("issuerId") REFERENCES "Issuer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
