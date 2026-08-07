import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { requireUser } from '../middleware/auth.js';

const prisma = new PrismaClient();
const router = Router();

router.post('/create', requireUser, async (req, res) => {
  const order = await prisma.order.findFirst({ where: { id: String(req.body.orderId), userId: (req as any).user.sub } });
  if (!order) return res.status(404).json({ error: 'Order not found' });
  if (order.status !== 'PENDING_PAYMENT') return res.status(409).json({ error: 'Order is not payable' });
  // In development the existing gateway modal acts as the test gateway.
  res.json({ mode: 'test', orderId: order.id, amount: order.totalAmountToman });
});

router.post('/verify', requireUser, async (req, res) => {
  const userId = (req as any).user.sub;
  const orderId = String(req.body.orderId || '');
  const success = req.body.success === true;
  const result = await prisma.$transaction(async (tx: any) => {
    const order = await tx.order.findFirst({ where: { id: orderId, userId }, include: { items: true } });
    if (!order) throw new Error('ORDER_NOT_FOUND');
    if (order.status === 'PAID' || order.status === 'PREPARING' || order.status === 'SHIPPED' || order.status === 'DELIVERED') return order;
    if (!success) return order;
    for (const item of order.items) {
      const product = await tx.product.findUnique({ where: { id: item.productId } });
      if (!product || product.stockCount < item.quantity) throw new Error(`OUT_OF_STOCK:${item.productName}`);
      const nextStock = product.stockCount - item.quantity;
      await tx.product.update({ where: { id: product.id }, data: { stockCount: nextStock, inStock: nextStock > 0 } });
    }
    await tx.cartItem.deleteMany({ where: { userId } });
    return tx.order.update({ where: { id: order.id }, data: { status: 'PAID' }, include: { items: true } });
  });
  res.json({ order: result });
});

router.get('/callback', (_req, res) => res.status(400).send('Payment callback requires server verification'));

export default router;
