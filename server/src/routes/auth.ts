import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const router = Router();
const ADMIN_PHONE = process.env.ADMIN_PHONE || '';
const TEST_OTP = process.env.TEST_OTP || '';
const normalizePhone = (value: string) => value.replace(/[۰-۹]/g, d => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(d))).replace(/\s|-/g, '');

router.post('/request-otp', async (req, res) => {
  const phone = normalizePhone(String(req.body.phone || ''));
  if (!phone) return res.status(400).json({ error: 'phone required' });
  // In production integrate real SMS; here we just return success
  res.json({ success: true, ...(process.env.NODE_ENV !== 'production' && TEST_OTP ? { testOtp: TEST_OTP } : {}) });
});

router.post('/verify-otp', async (req, res) => {
  const phone = normalizePhone(String(req.body.phone || ''));
  const code = String(req.body.code || '');
  if (!phone || !code) return res.status(400).json({ error: 'phone & code required' });
  if (!TEST_OTP || code !== TEST_OTP) return res.status(401).json({ error: 'invalid otp' });

  // naive verification: accept any code in dev; in prod use proper verification
  let user = await prisma.user.findUnique({ where: { phone } });
  if (!user) {
    user = await prisma.user.create({ data: { phone, fullName: '', role: phone === ADMIN_PHONE ? 'ADMIN' : 'USER' } as any });
  } else if (phone === ADMIN_PHONE && user.role !== 'ADMIN') {
    user = await prisma.user.update({ where: { id: user.id }, data: { role: 'ADMIN' } });
  }

  if (!process.env.JWT_SECRET) return res.status(500).json({ error: 'JWT_SECRET is not configured' });
  const token = jwt.sign({ sub: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '30d' });
  res.json({ token, user: { ...user, role: user.role === 'ADMIN' ? 'admin' : 'user' } });
});

export default router;
