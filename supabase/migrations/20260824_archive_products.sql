ALTER TABLE "Product"
  ADD COLUMN IF NOT EXISTS "isArchived" BOOLEAN NOT NULL DEFAULT FALSE;

CREATE INDEX IF NOT EXISTS "Product_isArchived_idx" ON "Product"("isArchived");
