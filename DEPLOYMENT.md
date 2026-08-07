# Deployment

## Supabase

1. Create a Supabase project.
2. Copy the **URI** connection string from Project Settings → Database → Connection string.
3. Use the session pooler URI for serverless deployments when available, and append `?sslmode=require`.
4. Run Prisma against that database from the project root:

```bash
npx prisma db push --schema=server/prisma/schema.prisma
```

The API uses Prisma models (`User`, `Product`, `CartItem`, `Order`, and `OrderItem`). Do not run the older Supabase SQL migration at the same time, because it creates a different schema.

## Vercel environment variables

Add these variables to the Vercel project for **Production**, **Preview**, and **Development** as needed:

```text
VITE_API_URL=/api
VITE_SITE_URL=https://YOUR-DOMAIN.vercel.app
DATABASE_URL=your-supabase-postgres-connection-string
JWT_SECRET=a-long-random-secret
ADMIN_PHONE=your-admin-phone
TEST_OTP=your-temporary-login-code
NODE_ENV=production
FRONTEND_URL=https://YOUR-DOMAIN.vercel.app
ZARINPAL_MERCHANT_ID=your-zarinpal-merchant-id
ZARINPAL_CALLBACK_URL=https://YOUR-DOMAIN.vercel.app/api/payments/callback
```

`TEST_OTP` is only a temporary login mechanism. Before public launch, replace it with a real SMS provider and remove the test-code flow. Payment routes are currently in test mode; configure and implement ZarinPal request/verify before accepting real payments.

The Vercel function is exposed at `/api/*`, and the frontend build is the normal Vite build.
