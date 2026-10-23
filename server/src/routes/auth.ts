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
  const codeHash = createHash('sha256').update(code).digest('hex');
  const { error: saveError } = await supabase.from('OtpCode').upsert({
    phone,
    code_hash: codeHash,
    expires_at: new Date(now + Number(process.env.OTP_EXPIRES_SECONDS || 120) * 1000).toISOString(),
    attempts: 0,
    last_sent_at: new Date(now).toISOString()
  });
  if (saveError) {
    console.error('OTP persistence failed:', saveError.message);
    return res.status(500).json({ error: 'ذخیره کد تأیید انجام نشد' });
  }
  try {
    const baseUrl = (process.env.SMSIR_BASE_URL || 'https://api.sms.ir/v1').replace(/\/$/, '');
    const response = await fetch(`${baseUrl}/send/verify`, {
      method: 'POST', headers: { 'Content-Type': 'application/json', 'X-API-KEY': apiKey },
      body: JSON.stringify({ mobile: phone, templateId, parameters: [{ name: 'OTP', value: code }] })
    });
    if (!response.ok) {
      const providerError = await response.text();
      console.error('SMS.ir rejected OTP request', { status: response.status, body: providerError.slice(0, 1000), templateId });
      const { error: cleanupError } = await supabase.from('OtpCode').delete().eq('phone', phone).eq('code_hash', codeHash);
      if (cleanupError) console.error('Failed to remove unsent OTP:', cleanupError.message);
      return res.status(502).json({ error: 'ارسال پیامک انجام نشد' });
    }
    return res.json({ success: true });
  } catch (error) {
    console.error('SMS.ir request failed:', error);
    const { error: cleanupError } = await supabase.from('OtpCode').delete().eq('phone', phone).eq('code_hash', codeHash);
    if (cleanupError) console.error('Failed to remove unsent OTP:', cleanupError.message);
    return res.status(502).json({ error: 'ارتباط با سرویس پیامک برقرار نشد' });
  }
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
    const { error: attemptsError } = await supabase.from('OtpCode').update({ attempts: entry.attempts + 1 }).eq('phone', phone);
    if (attemptsError) {
      console.error('Failed to record OTP verification attempt:', attemptsError.message);
      return res.status(500).json({ error: 'ثبت تلاش ورود انجام نشد' });
    }
    return res.status(401).json({ error: 'کد تایید اشتباه است' });
  }
  if (!process.env.JWT_SECRET) return res.status(500).json({ error: 'JWT_SECRET is not configured on the server' });
  const isAdminPhone = phone === normalizePhone(process.env.ADMIN_PHONE || '09166748552');
  const { data: existingUser, error: userLookupError } = await supabase.from('User').select('*').eq('phone', phone).maybeSingle();
  if (userLookupError) {
    console.error('Failed to look up OTP user', { code: userLookupError.code, message: userLookupError.message });
    return res.status(500).json({ error: 'Unable to access user account; check server Supabase configuration' });
  }
  let user = existingUser;
  if (!user) {
    const now = new Date().toISOString();
    const created = await supabase.from('User').insert({ id: randomUUID(), phone, fullName: '', role: isAdminPhone ? 'ADMIN' : 'USER', createdAt: now, updatedAt: now }).select().single();
    if (created.error) {
      console.error('Failed to create OTP user', { code: created.error.code, message: created.error.message });
      return res.status(500).json({ error: 'Unable to create user account; check server Supabase permissions' });
    }
    user = created.data;
  } else if (isAdminPhone && user.role !== 'ADMIN') {
    const updated = await supabase.from('User').update({ role: 'ADMIN', updatedAt: new Date().toISOString() }).eq('id', user.id).select().single();
    if (updated.error) console.error('Failed to update OTP user role', { code: updated.error.code, message: updated.error.message });
    user = updated.data || user;
  }
  if (!user) return res.status(500).json({ error: 'Unable to load user account' });
  const token = jwt.sign({ sub: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '30d' });
  const { data: consumedOtp, error: consumeError } = await supabase.from('OtpCode')
    .delete()
    .eq('phone', phone)
    .eq('code_hash', entry.code_hash)
    .select('phone')
    .maybeSingle();
  if (consumeError) {
    console.error('Failed to consume verified OTP:', consumeError.message);
    return res.status(500).json({ error: 'مصرف کد تأیید انجام نشد؛ لطفاً دوباره تلاش کنید' });
  }
  if (!consumedOtp) return res.status(401).json({ error: 'کد تأیید منقضی یا قبلاً استفاده شده است' });
  const { data: addresses } = await supabase.from('Address').select('*').eq('userId', user.id).order('isDefault', { ascending: false });
  return res.json({ token, user: { ...user, role: user.role === 'ADMIN' ? 'admin' : 'user', addresses: addresses || [] } });
});

export default router;
