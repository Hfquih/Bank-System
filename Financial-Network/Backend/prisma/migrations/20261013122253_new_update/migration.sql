/*
  Warnings:

  - You are about to drop the column `paymentId` on the `BINRange` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "BINRange_paymentId_key";

-- AlterTable
ALTER TABLE "BINRange" DROP COLUMN "paymentId";
