import { Router } from 'express';
import { supabase } from '../db.js';
import { requireAdmin } from '../middleware/auth.js';
const router = Router();
router.get('/', async (_req, res) => { const { data, error } = await supabase.from('Product').select('*'); if (error) return res.status(500).json({ error: error.message }); res.json({ products: data || [] }); });
router.post('/', requireAdmin, async (req, res) => { const { data, error } = await supabase.from('Product').insert(req.body).select().single(); if (error) return res.status(400).json({ error: error.message }); res.json({ product: data }); });
router.put('/:id', requireAdmin, async (req, res) => { const { data, error } = await supabase.from('Product').update(req.body).eq('id', req.params.id).select().single(); if (error) return res.status(400).json({ error: error.message }); res.json({ product: data }); });
router.delete('/:id', requireAdmin, async (req, res) => { const { error } = await supabase.from('Product').delete().eq('id', req.params.id); if (error) return res.status(400).json({ error: error.message }); res.json({ ok: true }); });
export default router;
