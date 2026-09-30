/*
  Warnings:

  - Added the required column `cancelUrl` to the `Payment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `successUrl` to the `Payment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `webhookUrl` to the `Payment` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Payment" ADD COLUMN     "cancelUrl" TEXT NOT NULL,
ADD COLUMN     "successUrl" TEXT NOT NULL,
ADD COLUMN     "webhookUrl" TEXT NOT NULL;
