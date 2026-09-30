/*
  Warnings:

  - Made the column `last4` on table `PaymentMethod` required. This step will fail if there are existing NULL values in that column.
  - Made the column `expMonth` on table `PaymentMethod` required. This step will fail if there are existing NULL values in that column.
  - Made the column `expYear` on table `PaymentMethod` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Payment" DROP CONSTRAINT "Payment_paymentMethodId_fkey";

-- AlterTable
ALTER TABLE "Payment" ALTER COLUMN "paymentMethodId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "PaymentMethod" ALTER COLUMN "last4" SET NOT NULL,
ALTER COLUMN "expMonth" SET NOT NULL,
ALTER COLUMN "expYear" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_paymentMethodId_fkey" FOREIGN KEY ("paymentMethodId") REFERENCES "PaymentMethod"("id") ON DELETE SET NULL ON UPDATE CASCADE;
