/*
  Warnings:

  - Added the required column `baseUrl` to the `NetworkToken` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "NetworkToken" ADD COLUMN     "baseUrl" TEXT NOT NULL;
