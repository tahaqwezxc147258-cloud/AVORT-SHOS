import { Router } from 'express';
import jwt from 'jsonwebtoken';
import { createHash, randomInt, randomUUID, timingSafeEqual } from 'node:crypto';
import { supabase } from '../db.js';

const router = Router();
const normalizePhone = (value: string) => {
  const raw = value.replace(/[۰-۹]/g, digit => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(digit))).replace(/[\s-]/g, '');
  const phone = raw.startsWith('+98') ? `0${raw.slice(3)}` : raw.startsWith('98') ? `0${raw.slice(2)}` : raw;
  return phone;
};
const normalizeDigits = (value: string) => value
  .replace(/[۰-۹]/g, digit => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(digit)))
  .replace(/[٠-٩]/g, digit => String('٠١٢٣٤٥٦٧٨٩'.indexOf(digit)));
const isIranMobile = (phone: string) => /^09\d{9}$/.test(normalizeDigits(phone));

router.post('/request-otp', async (req, res) => {
  const phone = normalizePhone(normalizeDigits(String(req.body.phone || '')));
  if (!isIranMobile(phone)) return res.status(400).json({ error: 'شماره موبایل معتبر نیست' });
  const now = Date.now();
  const { data: previous, error: lookupError } = await supabase.from('OtpCode').select('last_sent_at').eq('phone', phone).maybeSingle();
  if (lookupError) {
    console.error('OTP rate-limit lookup failed:', lookupError.message);
    return res.status(500).json({ error: 'سرویس ورود موقتاً در دسترس نیست' });
  }
  const rateLimit = Number(process.env.OTP_RATE_LIMIT_SECONDS || 60) * 1000;
  if (previous && now - new Date(previous.last_sent_at).getTime() < rateLimit) return res.status(429).json({ error: 'لطفاً کمی بعد دوباره تلاش کنید' });
  const code = String(randomInt(100000, 1000000));
  const apiKey = process.env.SMSIR_API_KEY;
  const templateId = Number(process.env.SMSIR_TEMPLATE_ID || 8467718);
  if (!apiKey) return res.status(500).json({ error: 'تنظیمات سرویس پیامک کامل نیست' });
  try {
    const baseUrl = (process.env.SMSIR_BASE_URL || 'https://api.sms.ir/v1').replace(/\/$/, '');
    const response = await fetch(`${baseUrl}/send/verify`, {
      method: 'POST', headers: { 'Content-Type': 'application/json', 'X-API-KEY': apiKey },
      body: JSON.stringify({ mobile: phone, templateId, parameters: [{ name: 'OTP', value: code }] })
    });
    if (!response.ok) {
      const providerError = await response.text();
      console.error('SMS.ir rejected OTP request', { status: response.status, body: providerError.slice(0, 1000), templateId });
      return res.status(502).json({ error: 'ارسال پیامک انجام نشد' });
    }
    const { error: saveError } = await supabase.from('OtpCode').upsert({
      phone,
      code_hash: createHash('sha256').update(code).digest('hex'),
      expires_at: new Date(now + Number(process.env.OTP_EXPIRES_SECONDS || 120) * 1000).toISOString(),
      attempts: 0,
      last_sent_at: new Date(now).toISOString()
    });
    if (saveError) {
      console.error('OTP persistence failed:', saveError.message);
      return res.status(500).json({ error: 'ذخیره کد تأیید انجام نشد' });
    }
    return res.json({ success: true });
  } catch { return res.status(502).json({ error: 'ارتباط با سرویس پیامک برقرار نشد' }); }
});

router.post('/verify-otp', async (req, res) => {
  const phone = normalizePhone(normalizeDigits(String(req.body.phone || '')));
  const code = normalizeDigits(String(req.body.code || ''));
  const { data: entry, error: lookupError } = await supabase.from('OtpCode').select('code_hash, expires_at, attempts').eq('phone', phone).maybeSingle();
  if (lookupError) {
    console.error('OTP verification lookup failed:', lookupError.message);
    return res.status(500).json({ error: 'سرویس ورود موقتاً در دسترس نیست' });
  }
  const maxAttempts = Number(process.env.OTP_MAX_ATTEMPTS || 5);
  if (!isIranMobile(phone) || !entry || Date.now() > new Date(entry.expires_at).getTime() || entry.attempts >= maxAttempts) return res.status(401).json({ error: 'کد تایید نامعتبر یا منقضی شده است' });
  const expectedHash = Buffer.from(entry.code_hash, 'hex');
  const providedHash = Buffer.from(createHash('sha256').update(code).digest('hex'), 'hex');
  if (expectedHash.length !== providedHash.length || !timingSafeEqual(expectedHash, providedHash)) {
    await supabase.from('OtpCode').update({ attempts: entry.attempts + 1 }).eq('phone', phone);
    return res.status(401).json({ error: 'کد تایید اشتباه است' });
  }
  await supabase.from('OtpCode').delete().eq('phone', phone);
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
