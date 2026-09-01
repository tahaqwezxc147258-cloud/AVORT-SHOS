import { Router } from 'express';
import { randomUUID } from 'node:crypto';
import { supabase } from '../db.js';
import { requireAdmin } from '../middleware/auth.js';

const router = Router();
router.post('/upload', requireAdmin, async (req, res) => {
  const match = String(req.body?.dataUrl || '').match(/^data:(image\/[\w.+-]+);base64,(.+)$/);
  if (!match) return res.status(400).json({ error: 'تصویر معتبر نیست' });
  const ext = match[1].split('/')[1].replace('jpeg', 'jpg');
  const path = `banners/${randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from('site-assets').upload(path, Buffer.from(match[2], 'base64'), { contentType: match[1], upsert: false });
  if (error) return res.status(400).json({ error: error.message });
  const { data } = supabase.storage.from('site-assets').getPublicUrl(path);
  res.json({ url: data.publicUrl });
});
router.get('/', async (_req, res) => {
  const { data, error } = await supabase.from('Banner').select('*').eq('isActive', true).order('sortOrder', { ascending: true });
  if (error) return res.status(500).json({ error: error.message });
  res.json({ banners: data || [] });
});
router.get('/all', requireAdmin, async (_req, res) => {
  const { data, error } = await supabase.from('Banner').select('*').order('sortOrder', { ascending: true });
  if (error) return res.status(500).json({ error: error.message });
  res.json({ banners: data || [] });
});
router.post('/', requireAdmin, async (req, res) => {
  const body = req.body || {};
  if (!body.desktopImage || !String(body.title || '').trim()) return res.status(400).json({ error: 'تصویر دسکتاپ و عنوان الزامی است' });
  const payload = { id: randomUUID(), desktopImage: body.desktopImage, mobileImage: body.mobileImage || null, title: String(body.title).trim(), description: String(body.description || ''), buttonLabel: String(body.buttonLabel || ''), href: String(body.href || '/shop'), isActive: body.isActive !== false, sortOrder: Number(body.sortOrder || 0), updatedAt: new Date().toISOString() };
  const { data, error } = await supabase.from('Banner').insert(payload).select().single();
  if (error) return res.status(400).json({ error: error.message });
  res.status(201).json({ banner: data });
});
router.put('/:id', requireAdmin, async (req, res) => {
  const { id: _id, createdAt: _createdAt, ...fields } = req.body || {};
  const { data, error } = await supabase.from('Banner').update({ ...fields, updatedAt: new Date().toISOString() }).eq('id', req.params.id).select().single();
  if (error) return res.status(400).json({ error: error.message });
  res.json({ banner: data });
});
router.delete('/:id', requireAdmin, async (req, res) => {
  const { error } = await supabase.from('Banner').delete().eq('id', req.params.id);
  if (error) return res.status(400).json({ error: error.message });
  res.json({ ok: true });
});
export default router;
