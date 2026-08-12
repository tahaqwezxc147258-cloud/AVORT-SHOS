import { Router } from 'express';
import jwt from 'jsonwebtoken';
import { supabase } from '../db.js';
const router = Router();
const norm = (v: string) => v.replace(/\s|-/g, '');
router.post('/request-otp', (req, res) => res.json({ success: Boolean(norm(String(req.body.phone || ''))) }));
router.post('/verify-otp', async (req, res) => { const phone = norm(String(req.body.phone || '')); if (!phone || String(req.body.code || '') !== (process.env.TEST_OTP || '')) return res.status(401).json({ error: 'invalid otp' }); let { data: user } = await supabase.from('User').select('*').eq('phone', phone).maybeSingle(); if (!user) { const r = await supabase.from('User').insert({ phone, fullName: '', role: phone === process.env.ADMIN_PHONE ? 'ADMIN' : 'USER' }).select().single(); user = r.data; } if (!user || !process.env.JWT_SECRET) return res.status(500).json({ error: 'authentication unavailable' }); res.json({ token: jwt.sign({ sub: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '30d' }), user: { ...user, role: user.role === 'ADMIN' ? 'admin' : 'user' } }); });
export default router;
