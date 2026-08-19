import { Router } from 'express';
import { supabase } from '../db.js';
import { requireUser } from '../middleware/auth.js';
const router = Router();
const merchantId = process.env.ZARINPAL_MERCHANT_ID;
const callbackUrl = process.env.ZARINPAL_CALLBACK_URL;
const requestUrl = 'https://payment.zarinpal.com/pg/v4/payment/request.json';
const verifyUrl = 'https://payment.zarinpal.com/pg/v4/payment/verify.json';
async function zarinpal(url: string, body: Record<string, unknown>) {
  if (!merchantId) throw new Error('ZARINPAL_MERCHANT_ID is not configured');
  const response = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify({ merchant_id: merchantId, ...body }) });
  const data = await response.json() as any;
  if (!response.ok || (!data.data?.authority && data.data?.code !== 100 && data.data?.code !== 101)) throw new Error(data.errors?.[0]?.message || 'ZarinPal request failed');
  return data.data;
}
router.post('/create', requireUser, async (req, res) => { try {
  if (!callbackUrl) return res.status(500).json({ error: 'ZARINPAL_CALLBACK_URL is not configured' });
  const { data: order, error } = await supabase.from('Order').select('*').eq('id', String(req.body.orderId)).eq('userId', (req as any).user.sub).single();
  if (error || !order) return res.status(404).json({ error: 'Order not found' });
  if (order.status !== 'PENDING_PAYMENT') return res.status(409).json({ error: 'Order is not payable' });
  const callback = new URL(callbackUrl); callback.searchParams.set('orderId', order.id);
  const payment = await zarinpal(requestUrl, { amount: Number(order.totalAmountToman) * 10, description: `پرداخت سفارش ${order.trackingCode}`, callback_url: callback.toString(), mobile: order.customerPhone });
  res.json({ mode: 'live', orderId: order.id, authority: payment.authority, paymentUrl: `https://payment.zarinpal.com/pg/StartPay/${payment.authority}` });
} catch (error) { console.error('ZarinPal create payment failed', error); res.status(502).json({ error: 'Unable to create payment with ZarinPal' }); } });
router.get('/callback', async (req, res) => { const orderId = String(req.query.orderId || ''); const authority = String(req.query.Authority || '');
  try { if (String(req.query.Status || '') !== 'OK' || !orderId || !authority) throw new Error('Payment was cancelled');
    const { data: order, error } = await supabase.from('Order').select('*').eq('id', orderId).single(); if (error || !order) throw new Error('Order not found');
    const payment = await zarinpal(verifyUrl, { amount: Number(order.totalAmountToman) * 10, authority }); if (![100, 101].includes(Number(payment.code))) throw new Error('Payment verification failed');
    await supabase.from('Order').update({ status: 'PAID' }).eq('id', orderId).eq('status', 'PENDING_PAYMENT');
    const frontend = process.env.FRONTEND_URL || 'https://avort.ir'; res.redirect(`${frontend}/?payment=success&orderId=${encodeURIComponent(orderId)}&refId=${encodeURIComponent(payment.ref_id || '')}`);
  } catch (error) { console.error('ZarinPal callback failed', error); const frontend = process.env.FRONTEND_URL || 'https://avort.ir'; res.redirect(`${frontend}/?payment=failed&orderId=${encodeURIComponent(orderId)}`); }
});
export default router;
