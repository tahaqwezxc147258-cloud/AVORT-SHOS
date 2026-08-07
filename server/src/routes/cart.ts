import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { requireUser } from '../middleware/auth.js';

const prisma = new PrismaClient();
const router = Router();

async function getItems(userId: string) {
  const items = await prisma.cartItem.findMany({
    where: { userId },
    include: { product: true },
    orderBy: { id: 'desc' },
  });
  return items.map((item: any) => ({
    product: item.product,
    selectedSize: item.selectedSize,
    selectedColor: (item.product.colors as any[]).find(c => c.name === item.colorName) || { name: item.colorName, hex: '#0f172a' },
    quantity: item.quantity,
  }));
}

router.use(requireUser);
router.get('/', async (req, res) => res.json({ items: await getItems((req as any).user.sub) }));

router.post('/', async (req, res) => {
  const userId = (req as any).user.sub;
  const { productId, quantity, selectedSize = 42, colorName = '' } = req.body;
  if (!productId || !Number.isInteger(Number(quantity)) || Number(quantity) === 0) {
    return res.status(400).json({ error: 'productId and non-zero quantity are required' });
  }
  const product = await prisma.product.findUnique({ where: { id: String(productId) } });
  if (!product) return res.status(404).json({ error: 'Product not found' });
  const existing = await prisma.cartItem.findUnique({ where: { userId_productId_selectedSize_colorName: { userId, productId: String(productId), selectedSize: Number(selectedSize), colorName: String(colorName) } } });
  const nextQuantity = (existing?.quantity || 0) + Number(quantity);
  if (nextQuantity <= 0) {
    if (existing) await prisma.cartItem.delete({ where: { id: existing.id } });
  } else if (existing) {
    await prisma.cartItem.update({ where: { id: existing.id }, data: { quantity: nextQuantity } });
  } else {
    await prisma.cartItem.create({ data: { userId, productId: String(productId), quantity: nextQuantity, selectedSize: Number(selectedSize), colorName: String(colorName) } });
  }
  res.json({ items: await getItems(userId) });
});

router.delete('/', async (req, res) => {
  await prisma.cartItem.deleteMany({ where: { userId: (req as any).user.sub } });
  res.json({ items: [] });
});

router.delete('/:productId', async (req, res) => {
  await prisma.cartItem.deleteMany({ where: { userId: (req as any).user.sub, productId: req.params.productId } });
  res.json({ items: await getItems((req as any).user.sub) });
});

export default router;
