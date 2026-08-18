import { Router } from 'express';
import jwt from 'jsonwebtoken';
import { randomUUID } from 'node:crypto';
import { supabase } from '../db.js';

const router = Router();
const otpStore = new Map<string, { code: string; expiresAt: number; attempts: number; lastSentAt: number }>();
const normalizePhone = (value: string) => {
  const raw = value.replace(/[\s-]/g, '');
  const phone = raw.startsWith('+98') ? `0${raw.slice(3)}` : raw.startsWith('98') ? `0${raw.slice(2)}` : raw;
  return phone;
};
const isIranMobile = (phone: string) => /^09\d{9}$/.test(phone);

router.post('/request-otp', async (req, res) => {
  const phone = normalizePhone(String(req.body.phone || ''));
  if (!isIranMobile(phone)) return res.status(400).json({ error: 'شماره موبایل معتبر نیست' });
  const now = Date.now();
  const previous = otpStore.get(phone);
  const rateLimit = Number(process.env.OTP_RATE_LIMIT_SECONDS || 60) * 1000;
  if (previous && now - previous.lastSentAt < rateLimit) return res.status(429).json({ error: 'لطفاً کمی بعد دوباره تلاش کنید' });
  const code = String(Math.floor(100000 + Math.random() * 900000));
  const apiKey = process.env.SMSIR_API_KEY;
  const templateId = Number(process.env.SMSIR_TEMPLATE_ID || 8143728);
  if (!apiKey) return res.status(500).json({ error: 'تنظیمات سرویس پیامک کامل نیست' });
  try {
    const response = await fetch(`${process.env.SMSIR_BASE_URL || 'https://api.sms.ir/v1'}/send/verify`, {
      method: 'POST', headers: { 'Content-Type': 'application/json', 'X-API-KEY': apiKey },
      body: JSON.stringify({ mobile: `98${phone.slice(1)}`, templateId, parameters: [{ name: 'Code', value: code }] })
    });
    if (!response.ok) return res.status(502).json({ error: 'ارسال پیامک انجام نشد' });
    otpStore.set(phone, { code, expiresAt: now + Number(process.env.OTP_EXPIRES_SECONDS || 120) * 1000, attempts: 0, lastSentAt: now });
    return res.json({ success: true });
  } catch { return res.status(502).json({ error: 'ارتباط با سرویس پیامک برقرار نشد' }); }
});

router.post('/verify-otp', async (req, res) => {
  const phone = normalizePhone(String(req.body.phone || ''));
  const code = String(req.body.code || '');
  const entry = otpStore.get(phone);
  const maxAttempts = Number(process.env.OTP_MAX_ATTEMPTS || 5);
  if (!isIranMobile(phone) || !entry || Date.now() > entry.expiresAt || entry.attempts >= maxAttempts) return res.status(401).json({ error: 'کد تایید نامعتبر یا منقضی شده است' });
  if (entry.code !== code) { entry.attempts += 1; return res.status(401).json({ error: 'کد تایید اشتباه است' }); }
  otpStore.delete(phone);
  const isAdminPhone = phone === normalizePhone(process.env.ADMIN_PHONE || '09166748552');
  let { data: user } = await supabase.from('User').select('*').eq('phone', phone).maybeSingle();
  if (!user) {
    const now = new Date().toISOString();
    const created = await supabase.from('User').insert({ id: randomUUID(), phone, fullName: '', role: isAdminPhone ? 'ADMIN' : 'USER', createdAt: now, updatedAt: now }).select().single();
    user = created.data;
  } else if (isAdminPhone && user.role !== 'ADMIN') {
    const updated = await supabase.from('User').update({ role: 'ADMIN', updatedAt: new Date().toISOString() }).eq('id', user.id).select().single();
    user = updated.data || user;
  }
  if (!user || !process.env.JWT_SECRET) return res.status(500).json({ error: 'authentication unavailable' });
  return res.json({ token: jwt.sign({ sub: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '30d' }), user: { ...user, role: user.role === 'ADMIN' ? 'admin' : 'user' } });
});

export default router;
