ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "gender" TEXT NOT NULL DEFAULT 'یونیسکس';
INSERT INTO storage.buckets (id, name, public) VALUES ('site-assets', 'site-assets', true) ON CONFLICT (id) DO NOTHING;
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
