/*
  Warnings:

  - A unique constraint covering the columns `[paymentId]` on the table `BINRange` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `paymentId` to the `BINRange` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "BINRange" ADD COLUMN     "paymentId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "BINRange_paymentId_key" ON "BINRange"("paymentId");
