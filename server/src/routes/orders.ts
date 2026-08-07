import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { requireAdmin, requireUser } from '../middleware/auth.js';

const prisma = new PrismaClient();
const router = Router();

const orderInclude = { items: true } as const;

router.get('/', requireUser, async (req, res) => {
  const user = (req as any).user;
  const orders = await prisma.order.findMany({ where: user.role === 'ADMIN' ? undefined : { userId: user.sub }, include: orderInclude, orderBy: { createdAt: 'desc' } });
  res.json({ orders });
});

router.post('/', requireUser, async (req, res) => {
  const { receiverName, phone, city, address, postalCode } = req.body;
  if (![receiverName, phone, city, address, postalCode].every(value => String(value || '').trim())) return res.status(400).json({ error: 'Complete shipping information is required' });
  const userId = (req as any).user.sub;
  const cart: any[] = await prisma.cartItem.findMany({ where: { userId }, include: { product: true } });
  if (!cart.length) return res.status(400).json({ error: 'Cart is empty' });
  const subtotal = cart.reduce((sum: number, item: any) => sum + item.product.priceToman * item.quantity, 0);
  const shippingFee = subtotal >= 10000000 ? 0 : 85000;
  const order = await prisma.order.create({
    data: {
      userId,
      trackingCode: `AVORI-${Date.now().toString().slice(-10)}`,
      customerName: String(receiverName).trim(),
      customerPhone: String(phone).trim(),
      shippingAddress: `${String(city).trim()}، ${String(address).trim()} (کدپستی: ${String(postalCode).trim()})`,
      totalAmountToman: subtotal + shippingFee,
      shippingFeeToman: shippingFee,
      paymentMethod: 'ZARINPAL',
      items: { create: cart.map((item: any) => ({ productId: item.productId, productName: item.product.nameFa, productImage: (item.product.images as string[])[0] || '', size: item.selectedSize, colorName: item.colorName, priceToman: item.product.priceToman, quantity: item.quantity })) },
    },
    include: orderInclude,
  });
  res.status(201).json({ order });
});

router.put('/:id', requireAdmin, async (req, res) => {
  const status = String(req.body.status);
  const validStatuses = ['PENDING_PAYMENT', 'PAID', 'PREPARING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];
  if (!validStatuses.includes(status)) return res.status(400).json({ error: 'Invalid order status' });
  const order = await prisma.order.update({ where: { id: req.params.id }, data: { status: status as any }, include: orderInclude });
  res.json({ order });
});

export default router;
