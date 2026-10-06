-- AlterTable
ALTER TABLE "OrderItem" ADD COLUMN     "returned" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "Invoice" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "number" TEXT NOT NULL,
    "total" DECIMAL(14,2) NOT NULL,
    "credited" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "paid" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "refunded" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Invoice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FinanceEntry" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "invoiceId" TEXT NOT NULL,
    "actorId" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "amount" DECIMAL(14,2) NOT NULL,
    "reference" TEXT NOT NULL,
    "requestKey" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FinanceEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PriceReview" (
    "id" TEXT NOT NULL,
    "authority" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "payload" JSONB NOT NULL,
    "reason" TEXT NOT NULL,
    "reviewedBy" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PriceReview_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PriceAlert" (
    "authority" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "firstSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "acknowledgedBy" TEXT,
    "acknowledgedAt" TIMESTAMP(3),

    CONSTRAINT "PriceAlert_pkey" PRIMARY KEY ("authority")
);

-- CreateIndex
CREATE UNIQUE INDEX "Invoice_organizationId_orderId_key" ON "Invoice"("organizationId", "orderId");

-- CreateIndex
CREATE UNIQUE INDEX "Invoice_organizationId_number_key" ON "Invoice"("organizationId", "number");

-- CreateIndex
CREATE UNIQUE INDEX "Invoice_organizationId_id_key" ON "Invoice"("organizationId", "id");

-- CreateIndex
CREATE INDEX "FinanceEntry_organizationId_createdAt_idx" ON "FinanceEntry"("organizationId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "FinanceEntry_organizationId_requestKey_key" ON "FinanceEntry"("organizationId", "requestKey");

-- AddForeignKey
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_organizationId_orderId_fkey" FOREIGN KEY ("organizationId", "orderId") REFERENCES "Order"("organizationId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FinanceEntry" ADD CONSTRAINT "FinanceEntry_organizationId_invoiceId_fkey" FOREIGN KEY ("organizationId", "invoiceId") REFERENCES "Invoice"("organizationId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Order" DROP CONSTRAINT "known_status";
ALTER TABLE "Order" ADD CONSTRAINT "known_status" CHECK ("status" IN ('SUBMITTED','PENDING_APPROVAL','CANCELLED','FULFILLED','RETURNED'));
ALTER TABLE "OrderItem" ADD CONSTRAINT "return_quantity_valid" CHECK ("returned" >= 0 AND "returned" <= "quantity");
ALTER TABLE "Invoice" ADD CONSTRAINT "invoice_amounts_valid" CHECK ("total" > 0 AND "credited" >= 0 AND "credited" <= "total" AND "paid" >= 0 AND "refunded" >= 0 AND "refunded" <= "paid");
ALTER TABLE "FinanceEntry" ADD CONSTRAINT "finance_entry_valid" CHECK ("amount" > 0 AND "kind" IN ('PAYMENT','CREDIT','REFUND'));
CREATE TRIGGER finance_append_only BEFORE UPDATE OR DELETE ON "FinanceEntry" FOR EACH ROW EXECUTE FUNCTION reject_audit_mutation();
