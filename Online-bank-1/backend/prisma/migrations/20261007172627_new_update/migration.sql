-- CreateEnum
CREATE TYPE "LinkedCardStatus" AS ENUM ('ACTIVE', 'BLOCKED', 'EXPIRED', 'CANCELED');

-- CreateEnum
CREATE TYPE "CardBrand" AS ENUM ('VISA', 'MASTERCARD');

-- CreateTable
CREATE TABLE "LinkedCard" (
    "id" SERIAL NOT NULL,
    "token" TEXT NOT NULL,
    "brand" "CardBrand" NOT NULL,
    "last4" TEXT NOT NULL,
    "expMonth" INTEGER NOT NULL,
    "expYear" INTEGER NOT NULL,
    "status" "LinkedCardStatus" NOT NULL DEFAULT 'ACTIVE',
    "accountId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LinkedCard_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "LinkedCard_token_key" ON "LinkedCard"("token");

-- CreateIndex
CREATE INDEX "LinkedCard_accountId_idx" ON "LinkedCard"("accountId");

-- AddForeignKey
ALTER TABLE "LinkedCard" ADD CONSTRAINT "LinkedCard_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
