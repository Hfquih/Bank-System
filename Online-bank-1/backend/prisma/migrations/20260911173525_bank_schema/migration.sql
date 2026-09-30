/*
  Warnings:

  - Added the required column `bankId` to the `Account` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "BankStatus" AS ENUM ('active', 'suspended', 'closed');

-- AlterTable
ALTER TABLE "Account" ADD COLUMN     "bankId" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "Bank" (
    "id" SERIAL NOT NULL,
    "keyName" TEXT NOT NULL,
    "logo" TEXT,
    "country" TEXT NOT NULL,
    "currency" VARCHAR(3) NOT NULL,
    "apiKey" TEXT NOT NULL,
    "apiSecret" TEXT NOT NULL,
    "status" "BankStatus" NOT NULL DEFAULT 'active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Bank_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Bank_keyName_key" ON "Bank"("keyName");

-- CreateIndex
CREATE UNIQUE INDEX "Bank_apiKey_key" ON "Bank"("apiKey");

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_bankId_fkey" FOREIGN KEY ("bankId") REFERENCES "Bank"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
