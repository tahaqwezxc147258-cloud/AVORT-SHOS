ALTER TABLE "Product"
  ADD COLUMN IF NOT EXISTS "gender" TEXT NOT NULL DEFAULT 'یونیسکس';

NOTIFY pgrst, 'reload schema';
