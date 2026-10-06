CREATE TABLE "PublicProduct" ("id" TEXT PRIMARY KEY,"name" TEXT NOT NULL,"category" TEXT NOT NULL,"reference" JSONB NOT NULL,"updatedAt" TIMESTAMP(3) NOT NULL);
CREATE INDEX "PublicProduct_category_name_idx" ON "PublicProduct"("category","name");
CREATE TABLE "PublicPriceSnapshot" ("authority" TEXT PRIMARY KEY,"state" TEXT NOT NULL,"rows" JSONB NOT NULL,"sourceUrl" TEXT NOT NULL,"published" TEXT,"effective" TEXT,"checkedAt" TIMESTAMP(3) NOT NULL,"updatedAt" TIMESTAMP(3) NOT NULL);
CREATE TABLE "PriceRefreshRun" ("id" TEXT PRIMARY KEY,"authority" TEXT NOT NULL,"status" TEXT NOT NULL,"count" INTEGER NOT NULL DEFAULT 0,"changed" INTEGER NOT NULL DEFAULT 0,"message" TEXT,"startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,"finishedAt" TIMESTAMP(3));
CREATE INDEX "PriceRefreshRun_startedAt_idx" ON "PriceRefreshRun"("startedAt");
CREATE TABLE "PublicPriceChange" ("id" TEXT PRIMARY KEY,"authority" TEXT NOT NULL,"sourceCode" TEXT NOT NULL,"previousPrice" DECIMAL(14,2),"price" DECIMAL(14,2) NOT NULL,"changedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP);
CREATE INDEX "PublicPriceChange_authority_changedAt_idx" ON "PublicPriceChange"("authority","changedAt");
