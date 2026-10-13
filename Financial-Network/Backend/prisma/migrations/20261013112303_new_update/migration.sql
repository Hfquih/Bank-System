-- CreateTable
CREATE TABLE "NetworkPayment" (
    "id" TEXT NOT NULL,
    "paymentId" TEXT NOT NULL,
    "issuerId" INTEGER NOT NULL,
    "binRangeId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "NetworkPayment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "NetworkPayment_paymentId_key" ON "NetworkPayment"("paymentId");

-- AddForeignKey
ALTER TABLE "NetworkPayment" ADD CONSTRAINT "NetworkPayment_issuerId_fkey" FOREIGN KEY ("issuerId") REFERENCES "Issuer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
