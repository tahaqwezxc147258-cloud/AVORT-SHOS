import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import productsRouter from './routes/products.js';
import authRouter from './routes/auth.js';
import cartRouter from './routes/cart.js';
import ordersRouter from './routes/orders.js';
import paymentsRouter from './routes/payments.js';
import bannersRouter from './routes/banners.js';

dotenv.config();

const app = express();
const allowedOrigins = (process.env.CLIENT_ORIGIN || process.env.FRONTEND_URL || 'http://localhost:3000').split(',').map(value => value.trim()).filter(Boolean);
app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use(express.json({ limit: '5mb' }));

const apiRouter = express.Router();
apiRouter.use('/', authRouter);
apiRouter.use('/products', productsRouter);
apiRouter.use('/session', authRouter);
apiRouter.use('/cart', cartRouter);
apiRouter.use('/orders', ordersRouter);
apiRouter.use('/payments', paymentsRouter);
apiRouter.use('/banners', bannersRouter);
apiRouter.get('/health', (_req, res) => res.json({ ok: true }));

app.use('/api', apiRouter);
app.use('/', apiRouter);

if (process.env.VERCEL !== '1') {
  const port = Number(process.env.PORT || 4000);
  app.listen(port, () => console.log(`Server listening on port ${port}`));
}

export default app;
