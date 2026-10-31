import { Router } from 'express';
import { supabase } from '../db.js';
import { requireUser } from '../middleware/auth.js';
const router = Router(); router.use(requireUser);
router.get('/', async (req, res) => {
  const { data, error } = await supabase.from('CartItem').select('*, product:Product(*)').eq('userId', (req as any).user.sub).order('id', { ascending: false });
  if (error) return res.status(500).json({ error: error.message });
  res.json({
    items: (data || []).map((item: any) => ({
      ...item,
      product: item.product,
      selectedColor: (item.product?.colors || []).find((color: any) => color.name === item.colorName) || { name: item.colorName, hex: '#0f172a' },
    })),
  });
});
router.post('/', async (req, res) => {
  const userId = (req as any).user.sub;
  const { productId, quantity, selectedSize = 42, colorName = '' } = req.body || {};
  const parsedQuantity = Number(quantity);
  const size = Number(selectedSize);
  if (!productId || !Number.isInteger(parsedQuantity) || parsedQuantity === 0 || !Number.isInteger(size) || !String(colorName)) {
    return res.status(400).json({ error: 'اطلاعات محصول برای سبد خرید معتبر نیست' });
  }

  const { data: product, error: productError } = await supabase.from('Product').select('*').eq('id', String(productId)).maybeSingle();
  if (productError) return res.status(500).json({ error: productError.message });
  if (!product) return res.status(404).json({ error: 'محصول پیدا نشد' });
  if (!(Array.isArray(product.sizes) && product.sizes.map(Number).includes(size))) return res.status(400).json({ error: 'سایز انتخاب‌شده برای این محصول موجود نیست' });
  if (!(Array.isArray(product.colors) && product.colors.some((color: any) => color.name === String(colorName)))) return res.status(400).json({ error: 'رنگ انتخاب‌شده برای این محصول معتبر نیست' });

  const { data: old, error: oldError } = await supabase.from('CartItem').select('*').match({
    userId,
    productId: String(productId),
    selectedSize: size,
    colorName: String(colorName),
  }).maybeSingle();
  if (oldError) return res.status(500).json({ error: oldError.message });

  const next = (old?.quantity || 0) + parsedQuantity;
  if (parsedQuantity > 0 && (!product.inStock || Number(product.stockCount) < 1 || next > Number(product.stockCount))) {
    return res.status(409).json({
      error: !product.inStock || Number(product.stockCount) < 1 ? 'این محصول اتمام موجودی است' : 'تعداد انتخاب‌شده بیشتر از موجودی محصول است',
    });
  }
  if (next <= 0 && !old) return res.status(400).json({ error: 'محصول در سبد خرید پیدا نشد' });

  let result;
  if (next <= 0) result = await supabase.from('CartItem').delete().eq('id', old.id);
  else if (old) result = await supabase.from('CartItem').update({ quantity: next }).eq('id', old.id);
  else result = await supabase.from('CartItem').insert({ userId, productId: String(productId), quantity: next, selectedSize: size, colorName: String(colorName) });
  if (result?.error) return res.status(400).json({ error: result.error.message });
  res.json({ ok: true });
});
router.delete('/', async (req, res) => { await supabase.from('CartItem').delete().eq('userId', (req as any).user.sub); res.json({ items: [] }); });
router.delete('/:productId', async (req, res) => {
  let query = supabase.from('CartItem').delete().match({
    userId: (req as any).user.sub,
    productId: req.params.productId,
  });
  if (req.query.selectedSize !== undefined && req.query.colorName !== undefined) {
    query = query
      .eq('selectedSize', Number(req.query.selectedSize))
      .eq('colorName', String(req.query.colorName));
  }
  const { error } = await query;
  if (error) return res.status(400).json({ error: error.message });
  res.json({ ok: true });
});
export default router;
