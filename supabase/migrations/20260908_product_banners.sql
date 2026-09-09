ALTER TABLE "Banner" ADD COLUMN IF NOT EXISTS "productId" TEXT;
ALTER TABLE "Banner" ADD COLUMN IF NOT EXISTS "imageIndex" INTEGER;
CREATE INDEX IF NOT EXISTS "Banner_productId_idx" ON "Banner"("productId");
