-- CreateEnum
CREATE TYPE "MoneyRequestStatus" AS ENUM ('pending', 'accepted', 'rejected', 'cancelled');

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

-- CreateIndex
CREATE INDEX "MoneyRequest_requesterAccountId_idx" ON "MoneyRequest"("requesterAccountId");

-- CreateIndex
CREATE INDEX "MoneyRequest_recipientAccountId_idx" ON "MoneyRequest"("recipientAccountId");

-- CreateIndex
CREATE INDEX "MoneyRequest_status_idx" ON "MoneyRequest"("status");

-- AddForeignKey
ALTER TABLE "MoneyRequest" ADD CONSTRAINT "MoneyRequest_requesterAccountId_fkey" FOREIGN KEY ("requesterAccountId") REFERENCES "Account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MoneyRequest" ADD CONSTRAINT "MoneyRequest_recipientAccountId_fkey" FOREIGN KEY ("recipientAccountId") REFERENCES "Account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
