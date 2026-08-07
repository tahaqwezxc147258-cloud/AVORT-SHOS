// Seed script intentionally left empty to avoid inserting sample/fake data.
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  // No-op: remove creation of test/admin users or sample products.
}

main().finally(() => prisma.$disconnect());
