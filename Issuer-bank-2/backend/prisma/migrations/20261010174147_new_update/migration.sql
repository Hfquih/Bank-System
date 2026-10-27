/*
  Warnings:

  - Made the column `description` on table `MoneyRequest` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "MoneyRequest" ALTER COLUMN "description" SET NOT NULL;

-- AlterTable
ALTER TABLE "Transaction" ADD COLUMN     "paymentId" TEXT;
