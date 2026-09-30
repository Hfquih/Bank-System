-- DropForeignKey
ALTER TABLE "Account" DROP CONSTRAINT "Account_bankId_fkey";

-- AlterTable
ALTER TABLE "Account" ALTER COLUMN "bankId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_bankId_fkey" FOREIGN KEY ("bankId") REFERENCES "Bank"("id") ON DELETE SET NULL ON UPDATE CASCADE;
