-- CreateEnum
CREATE TYPE "AccountStatus" AS ENUM ('active', 'frozen', 'closed');

-- CreateTable
CREATE TABLE "Account" (
    "id" SERIAL NOT NULL,
    "accountNumber" TEXT NOT NULL,
    "balance" DECIMAL(65,30) NOT NULL,
    "availableBalance" DECIMAL(65,30) NOT NULL,
    "currency" TEXT NOT NULL,
    "status" "AccountStatus" NOT NULL DEFAULT 'active',
    "userId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Account_accountNumber_key" ON "Account"("accountNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Account_userId_key" ON "Account"("userId");

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
