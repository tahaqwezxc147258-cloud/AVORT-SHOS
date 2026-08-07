import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { requireAdmin } from '../middleware/auth.js';

const prisma = new PrismaClient();
const router = Router();

router.get('/', async (_req, res) => {
  const products = await prisma.product.findMany();
  res.json({ products });
});

router.post('/', requireAdmin, async (req, res) => {
  const body = req.body;
  try {
    const created = await prisma.product.create({ data: { ...body } });
    res.json({ product: created });
  } catch (e) {
    res.status(400).json({ error: String(e) });
  }
});

router.put('/:id', requireAdmin, async (req, res) => {
  const { id } = req.params;
  try {
    const updated = await prisma.product.update({ where: { id }, data: req.body });
    res.json({ product: updated });
  } catch (e) {
    res.status(400).json({ error: String(e) });
  }
});

router.delete('/:id', requireAdmin, async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.product.delete({ where: { id } });
    res.json({ ok: true });
  } catch (e) {
    res.status(400).json({ error: String(e) });
  }
});

export default router;
