-- CreateEnum
CREATE TYPE "LedgerEntryType" AS ENUM ('debit', 'credit');

-- CreateEnum
CREATE TYPE "TransactionType" AS ENUM ('transfer', 'deposit', 'withdrawal', 'payment', 'refund', 'fee');

-- CreateEnum
CREATE TYPE "TransactionStatus" AS ENUM ('pending', 'processing', 'completed', 'failed', 'cancelled', 'reversed');

-- CreateEnum
CREATE TYPE "MoneyRequestStatus" AS ENUM ('pending', 'accepted', 'rejected', 'cancelled');

-- CreateEnum
CREATE TYPE "RefundRequestStatus" AS ENUM ('pending', 'approved', 'rejected');

-- CreateTable
CREATE TABLE "Transaction" (
    "id" SERIAL NOT NULL,
    "reference" TEXT NOT NULL,
    "type" "TransactionType" NOT NULL,
    "status" "TransactionStatus" NOT NULL DEFAULT 'pending',
    "amount" DECIMAL(19,4) NOT NULL,
    "currency" VARCHAR(3) NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Transaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LedgerEntry" (
    "id" SERIAL NOT NULL,
    "transactionId" INTEGER NOT NULL,
    "accountId" INTEGER NOT NULL,
    "type" "LedgerEntryType" NOT NULL,
    "amount" DECIMAL(19,4) NOT NULL,
    "currency" VARCHAR(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LedgerEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MoneyRequest" (
    "id" SERIAL NOT NULL,
    "amount" DECIMAL(19,4) NOT NULL,
    "currency" VARCHAR(3) NOT NULL,
    "description" TEXT,
    "status" "MoneyRequestStatus" NOT NULL DEFAULT 'pending',
    "requesterAccountId" INTEGER NOT NULL,
    "recipientAccountId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MoneyRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RefundRequest" (
    "id" SERIAL NOT NULL,
    "transactionId" INTEGER NOT NULL,
    "accountId" INTEGER NOT NULL,
    "amount" DECIMAL(19,4) NOT NULL,
    "reason" TEXT NOT NULL,
    "status" "RefundRequestStatus" NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RefundRequest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Transaction_reference_key" ON "Transaction"("reference");

-- CreateIndex
CREATE INDEX "Transaction_type_idx" ON "Transaction"("type");

-- CreateIndex
CREATE INDEX "Transaction_status_idx" ON "Transaction"("status");

-- CreateIndex
CREATE INDEX "Transaction_createdAt_idx" ON "Transaction"("createdAt");

-- CreateIndex
CREATE INDEX "LedgerEntry_transactionId_idx" ON "LedgerEntry"("transactionId");

-- CreateIndex
CREATE INDEX "LedgerEntry_accountId_idx" ON "LedgerEntry"("accountId");

-- CreateIndex
CREATE INDEX "LedgerEntry_createdAt_idx" ON "LedgerEntry"("createdAt");

-- CreateIndex
CREATE INDEX "MoneyRequest_requesterAccountId_idx" ON "MoneyRequest"("requesterAccountId");

-- CreateIndex
CREATE INDEX "MoneyRequest_recipientAccountId_idx" ON "MoneyRequest"("recipientAccountId");

-- CreateIndex
CREATE INDEX "MoneyRequest_status_idx" ON "MoneyRequest"("status");

-- CreateIndex
CREATE UNIQUE INDEX "RefundRequest_transactionId_key" ON "RefundRequest"("transactionId");

-- AddForeignKey
ALTER TABLE "LedgerEntry" ADD CONSTRAINT "LedgerEntry_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "Transaction"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LedgerEntry" ADD CONSTRAINT "LedgerEntry_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MoneyRequest" ADD CONSTRAINT "MoneyRequest_requesterAccountId_fkey" FOREIGN KEY ("requesterAccountId") REFERENCES "Account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MoneyRequest" ADD CONSTRAINT "MoneyRequest_recipientAccountId_fkey" FOREIGN KEY ("recipientAccountId") REFERENCES "Account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RefundRequest" ADD CONSTRAINT "RefundRequest_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "Transaction"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RefundRequest" ADD CONSTRAINT "RefundRequest_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
