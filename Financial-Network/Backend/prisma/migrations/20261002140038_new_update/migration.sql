/*
  Warnings:

  - Added the required column `baseUrl` to the `Issuer` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Issuer" ADD COLUMN     "baseUrl" TEXT NOT NULL;
