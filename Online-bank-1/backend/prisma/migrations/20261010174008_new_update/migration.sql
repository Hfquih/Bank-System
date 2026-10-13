/*
  Warnings:

  - You are about to drop the `RefundRequest` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "RefundRequest" DROP CONSTRAINT "RefundRequest_accountId_fkey";

-- DropForeignKey
ALTER TABLE "RefundRequest" DROP CONSTRAINT "RefundRequest_transactionId_fkey";

-- AlterTable
ALTER TABLE "Transaction" ADD COLUMN     "paymentId" TEXT;

-- DropTable
DROP TABLE "RefundRequest";

-- DropEnum
DROP TYPE "RefundRequestStatus";
