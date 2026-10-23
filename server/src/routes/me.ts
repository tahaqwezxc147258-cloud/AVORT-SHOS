import { Router } from 'express';
import { randomUUID } from 'node:crypto';
import { supabase } from '../db.js';
import { requireUser } from '../middleware/auth.js';

const router = Router();
const userIdFrom = (req: any) => String(req.user?.sub || '');

async function loadProfile(userId: string) {
  const { data: user, error: userError } = await supabase.from('User').select('*').eq('id', userId).single();
  if (userError || !user) throw new Error(userError?.message || 'User not found');
  const { data: addresses, error: addressError } = await supabase.from('Address').select('*').eq('userId', userId).order('isDefault', { ascending: false });
  if (addressError) throw new Error(addressError.message);
  return { ...user, role: user.role === 'ADMIN' ? 'admin' : 'user', addresses: addresses || [] };
}

router.get('/', requireUser, async (req, res) => {
  try { res.json({ user: await loadProfile(userIdFrom(req)) }); }
  catch (error) { res.status(400).json({ error: error instanceof Error ? error.message : 'Unable to load profile' }); }
});

router.put('/', requireUser, async (req, res) => {
  const userId = userIdFrom(req);
  const payload = {
    fullName: String(req.body?.fullName || ''),
    avatar: String(req.body?.avatar || ''),
    updatedAt: new Date().toISOString(),
  };
  const { error } = await supabase.from('User').update(payload).eq('id', userId);
  if (error) return res.status(400).json({ error: error.message });
  try { res.json({ user: await loadProfile(userId) }); }
  catch (err) { res.status(400).json({ error: err instanceof Error ? err.message : 'Unable to load profile' }); }
});

const addressPayload = (body: any) => ({
  title: String(body?.title || '????').trim(),
  receiverName: String(body?.receiverName || '').trim(),
  phone: String(body?.phone || '').trim(),
  city: String(body?.city || '').trim(),
  address: String(body?.address || '').trim(),
  postalCode: String(body?.postalCode || '').trim(),
  isDefault: Boolean(body?.isDefault),
});
const isComplete = (address: ReturnType<typeof addressPayload>) => Boolean(address.receiverName && address.phone && address.city && address.address && address.postalCode);

router.post('/addresses', requireUser, async (req, res) => {
  const userId = userIdFrom(req);
  const address = addressPayload(req.body);
  if (!isComplete(address)) return res.status(400).json({ error: '??????? ???? ???? ????' });
  if (address.isDefault) await supabase.from('Address').update({ isDefault: false }).eq('userId', userId);
  const { error } = await supabase.from('Address').insert({ id: randomUUID(), userId, ...address });
  if (error) return res.status(400).json({ error: error.message });
  try { res.json({ addresses: (await loadProfile(userId)).addresses }); }
  catch (err) { res.status(400).json({ error: err instanceof Error ? err.message : 'Unable to load addresses' }); }
});

router.put('/addresses/:id', requireUser, async (req, res) => {
  const userId = userIdFrom(req);
  const address = addressPayload(req.body);
  if (!isComplete(address)) return res.status(400).json({ error: '??????? ???? ???? ????' });
  if (address.isDefault) await supabase.from('Address').update({ isDefault: false }).eq('userId', userId);
  const { error } = await supabase.from('Address').update(address).eq('id', req.params.id).eq('userId', userId);
  if (error) return res.status(400).json({ error: error.message });
  try { res.json({ addresses: (await loadProfile(userId)).addresses }); }
  catch (err) { res.status(400).json({ error: err instanceof Error ? err.message : 'Unable to load addresses' }); }
});

router.delete('/addresses/:id', requireUser, async (req, res) => {
  const userId = userIdFrom(req);
  const { error } = await supabase.from('Address').delete().eq('id', req.params.id).eq('userId', userId);
  if (error) return res.status(400).json({ error: error.message });
  try { res.json({ addresses: (await loadProfile(userId)).addresses }); }
  catch (err) { res.status(400).json({ error: err instanceof Error ? err.message : 'Unable to load addresses' }); }
});

export default router;