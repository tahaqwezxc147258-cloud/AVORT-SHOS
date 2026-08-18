import { Router } from 'express';
import { randomUUID } from 'node:crypto';
import { supabase } from '../db.js';
import { requireAdmin } from '../middleware/auth.js';
const router = Router();
router.get('/', async (_req, res) => { const { data, error } = await supabase.from('Product').select('*'); if (error) return res.status(500).json({ error: error.message }); res.json({ products: data || [] }); });
router.post('/', requireAdmin, async (req, res) => {
  const now = new Date().toISOString();
  const payload = { ...req.body, id: req.body.id || randomUUID(), createdAt: now, updatedAt: now };
  const { data, error } = await supabase.from('Product').insert(payload).select().single();
  if (error) return res.status(400).json({ error: error.message, code: error.code });
  res.json({ product: data });
});
router.put('/:id', requireAdmin, async (req, res) => {
  const { id: _id, createdAt: _createdAt, ...fields } = req.body;
  const { data, error } = await supabase.from('Product').update({ ...fields, updatedAt: new Date().toISOString() }).eq('id', req.params.id).select().single();
  if (error) return res.status(400).json({ error: error.message, code: error.code });
  res.json({ product: data });
});
router.delete('/:id', requireAdmin, async (req, res) => { const { error } = await supabase.from('Product').delete().eq('id', req.params.id); if (error) return res.status(400).json({ error: error.message }); res.json({ ok: true }); });
export default router;
