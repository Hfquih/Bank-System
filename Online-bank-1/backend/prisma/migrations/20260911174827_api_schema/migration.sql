/*
  Warnings:

  - You are about to drop the column `bankId` on the `Account` table. All the data in the column will be lost.
  - You are about to drop the `Bank` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "APIKeyStatus" AS ENUM ('active', 'revoked');

-- DropForeignKey
ALTER TABLE "Account" DROP CONSTRAINT "Account_bankId_fkey";

-- AlterTable
ALTER TABLE "Account" DROP COLUMN "bankId";

-- DropTable
DROP TABLE "Bank";

-- DropEnum
DROP TYPE "BankStatus";

-- CreateTable
CREATE TABLE "APIKey" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "apiKey" TEXT NOT NULL,
    "apiSecret" TEXT NOT NULL,
    "status" "APIKeyStatus" NOT NULL DEFAULT 'active',
    "accountId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "APIKey_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "APIKey_apiKey_key" ON "APIKey"("apiKey");

-- CreateIndex
CREATE INDEX "APIKey_accountId_idx" ON "APIKey"("accountId");

-- AddForeignKey
ALTER TABLE "APIKey" ADD CONSTRAINT "APIKey_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
