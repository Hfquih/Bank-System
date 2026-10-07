/*
  Warnings:

  - You are about to drop the column `orderReference` on the `Payment` table. All the data in the column will be lost.
  - Added the required column `userReference` to the `Payment` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Payment" DROP COLUMN "orderReference",
ADD COLUMN     "userReference" TEXT NOT NULL;
