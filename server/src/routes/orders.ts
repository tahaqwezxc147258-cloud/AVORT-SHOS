import { Router } from 'express';
import { randomUUID } from 'crypto';
import { supabase } from '../db.js';
import { optionalUser, requireAdmin, requireUser } from '../middleware/auth.js';

const router = Router();
const STATUSES = ['PENDING_PAYMENT', 'PAID', 'PREPARING', 'SHIPPED', 'DELIVERED', 'CANCELLED'] as const;

router.post('/', optionalUser, async (req, res) => {
  const { receiverName, phone, city, address, postalCode, items = [] } = req.body || {};
  if (![receiverName, phone, city, address, postalCode].every(value => String(value || '').trim())) return res.status(400).json({ error: 'اطلاعات گیرنده کامل نیست' });
  const userId = (req as any).user?.sub || null;
  let sourceItems: any[] = items;
  if (userId && !items.length) {
    const { data, error } = await supabase.from('CartItem').select('*, product:Product(*)').eq('userId', userId);
    if (error) return res.status(500).json({ error: error.message });
    sourceItems = data || [];
  }
  if (!sourceItems.length) return res.status(400).json({ error: 'سبد خرید خالی است' });
  let snapshots: any[];
  try {
    snapshots = sourceItems.map((item: any) => {
      const p = item.product || item;
      const size = Number(item.selectedSize ?? item.size);
      const colorName = String(item.colorName ?? item.selectedColor?.name ?? '');
      const colors = Array.isArray(p.colors) ? p.colors : [];
      const color = colors.find((entry: any) => entry.name === colorName);
      const sizes = Array.isArray(p.sizes) ? p.sizes.map(Number) : [];
      if (!p.id || !sizes.includes(size) || !color) throw new Error('محصول، سایز یا رنگ سفارش معتبر نیست');
      const quantity = Math.max(1, Number(item.quantity || 1));
      const withSpecialBox = Boolean(item.withSpecialBox) && Boolean(p.specialBoxAvailable);
      const specialBoxPrice = withSpecialBox ? Math.max(0, Number(p.specialBoxPrice || 350000)) : 0;
      if (!p.inStock || Number(p.stockCount) < quantity) throw new Error(`موجودی محصول ${p.nameFa || p.name} کافی نیست`);
      return { productId: String(p.id), productName: String(p.nameFa || p.name), productNameEn: String(p.name || ''), brand: String(p.brand || ''), productImage: String((p.images || [])[0] || ''), size, colorName, colorHex: String(color.hex || ''), priceToman: Number(p.priceToman), quantity, withSpecialBox, specialBoxPrice, packagingLabel: withSpecialBox ? 'جعبه خاص + جعبه عادی' : 'جعبه عادی' };
    });
  } catch (error) { return res.status(400).json({ error: error instanceof Error ? error.message : 'اطلاعات محصول نامعتبر است' }); }
  const subtotal = snapshots.reduce((sum, item) => sum + (item.priceToman + item.specialBoxPrice) * item.quantity, 0);
  const shippingFee = subtotal >= 10000000 ? 0 : 85000;
  const orderId = randomUUID();
  const { data: order, error: orderError } = await supabase.from('Order').insert({ id: orderId, trackingCode: `AVOR-${Date.now().toString(36).toUpperCase()}`, userId, customerName: String(receiverName).trim(), customerPhone: String(phone).trim(), city: String(city).trim(), postalCode: String(postalCode).trim(), shippingAddress: String(address).trim(), totalAmountToman: subtotal + shippingFee, shippingFeeToman: shippingFee, status: 'PENDING_PAYMENT', paymentMethod: 'ZARINPAL' }).select('*').single();
  if (orderError) return res.status(500).json({ error: orderError.message });
  const { error: itemError } = await supabase.from('OrderItem').insert(snapshots.map(item => ({ id: randomUUID(), orderId, ...item })));
  if (itemError) { await supabase.from('Order').delete().eq('id', orderId); return res.status(500).json({ error: itemError.message }); }
  if (userId) await supabase.from('CartItem').delete().eq('userId', userId);
  return res.status(201).json({ order: { ...order, items: snapshots } });
});

router.get('/', requireUser, async (req, res) => {
  let query = supabase.from('Order').select('*, items:OrderItem(*)').order('createdAt', { ascending: false });
  if ((req as any).user.role !== 'ADMIN') {
    query = query.eq('userId', (req as any).user.sub).neq('status', 'PENDING_PAYMENT');
  }
  const { data, error } = await query;
  if (error) return res.status(500).json({ error: error.message });
  return res.json({ orders: data || [] });
});

router.post('/:id/confirm', async (req, res) => {
  const trackingCode = String(req.body?.trackingCode || '');
  if (!trackingCode) return res.status(400).json({ error: 'کد پیگیری الزامی است' });
  const { data, error } = await supabase.from('Order').update({ status: 'PAID' }).eq('id', req.params.id).eq('trackingCode', trackingCode).eq('status', 'PENDING_PAYMENT').select('*, items:OrderItem(*)').single();
  if (error || !data) return res.status(404).json({ error: 'سفارش پیدا نشد یا قابل تأیید نیست' });
  return res.json({ order: data });
});

router.put('/:id', requireAdmin, async (req, res) => {
  const status = String(req.body?.status || '');
  if (!STATUSES.includes(status as any)) return res.status(400).json({ error: 'وضعیت سفارش نامعتبر است' });
  const { data, error } = await supabase.from('Order').update({ status }).eq('id', req.params.id).select('*, items:OrderItem(*)').single();
  if (error) return res.status(400).json({ error: error.message });
  return res.json({ order: data });
});

export default router;
