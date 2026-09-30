-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('admin', 'user');

-- AlterTable
ALTER TABLE "Customer" ADD COLUMN     "role" "UserRole" NOT NULL DEFAULT 'user';
