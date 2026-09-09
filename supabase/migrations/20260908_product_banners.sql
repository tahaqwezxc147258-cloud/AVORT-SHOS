-- Make this migration safe to run on databases where the banner migration
-- has not been applied yet (for example a newly-created Supabase project).
CREATE TABLE IF NOT EXISTS "Banner" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "desktopImage" TEXT NOT NULL,
  "mobileImage" TEXT,
  "title" TEXT NOT NULL DEFAULT '',
  "description" TEXT NOT NULL DEFAULT '',
  "buttonLabel" TEXT NOT NULL DEFAULT '',
  "href" TEXT NOT NULL DEFAULT '/shop',
  "isActive" BOOLEAN NOT NULL DEFAULT TRUE,
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE "Banner" ADD COLUMN IF NOT EXISTS "productId" TEXT;
ALTER TABLE "Banner" ADD COLUMN IF NOT EXISTS "imageIndex" INTEGER;
CREATE INDEX IF NOT EXISTS "Banner_productId_idx" ON "Banner"("productId");
