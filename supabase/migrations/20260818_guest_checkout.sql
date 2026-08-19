-- Allow checkout orders without requiring an account.
ALTER TABLE "Order" ALTER COLUMN "userId" DROP NOT NULL;
