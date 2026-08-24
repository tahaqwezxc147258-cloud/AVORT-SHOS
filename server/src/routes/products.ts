import { Router } from 'express';
import { randomUUID } from 'node:crypto';
import { supabase } from '../db.js';
import { requireAdmin } from '../middleware/auth.js';
const router = Router();
router.get('/', async (_req, res) => { let query = supabase.from('Product').select('*').eq('isArchived', false); let result = await query; if (result.error?.code === '42703') result = await supabase.from('Product').select('*'); if (result.error) return res.status(500).json({ error: result.error.message }); res.json({ products: result.data || [] }); });
router.post('/', requireAdmin, async (req, res) => {
  if (req.body?._action === 'delete') {
    const id = String(req.body?.id || '');
    if (!id) return res.status(400).json({ error: 'Product id is required' });
    await supabase.from('CartItem').delete().eq('productId', id);
    const { error } = await supabase.from('Product').delete().eq('id', id);
    if (error?.code === '23503') {
      const archived = await supabase.from('Product').update({ isArchived: true, updatedAt: new Date().toISOString() }).eq('id', id);
      if (archived.error) return res.status(400).json({ error: archived.error.message, code: archived.error.code });
      return res.json({ ok: true, archived: true });
    }
    if (error) return res.status(400).json({ error: error.message, code: error.code });
    return res.json({ ok: true, deleted: true });
  }
  const now = new Date().toISOString();
  const payload = { ...req.body, id: req.body.id || randomUUID(), isArchived: false, createdAt: now, updatedAt: now };
  const { data, error } = await supabase.from('Product').insert(payload).select().single();
  if (error) return res.status(400).json({ error: error.message, code: error.code });
  res.json({ product: data });
});
router.put('/:id', requireAdmin, async (req, res) => { const { id: _id, createdAt: _createdAt, ...fields } = req.body; const { data, error } = await supabase.from('Product').update({ ...fields, updatedAt: new Date().toISOString() }).eq('id', req.params.id).select().single(); if (error) return res.status(400).json({ error: error.message, code: error.code }); res.json({ product: data }); });
export default router;
