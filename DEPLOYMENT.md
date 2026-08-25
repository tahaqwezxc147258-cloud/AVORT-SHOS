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
VITE_SITE_URL=https://avort.ir
DATABASE_URL=your-supabase-postgres-connection-string
JWT_SECRET=a-long-random-secret
ADMIN_PHONE=09166748552
SMSIR_API_KEY=server-only-smsir-key
SMSIR_TEMPLATE_ID=8467718
SMSIR_BASE_URL=https://api.sms.ir/v1
OTP_EXPIRES_SECONDS=120
OTP_MAX_ATTEMPTS=5
OTP_RATE_LIMIT_SECONDS=60
TEST_OTP=
NODE_ENV=production
FRONTEND_URL=https://avort.ir
ZARINPAL_MERCHANT_ID=b64b13cf-27f7-4779-b882-eee27a1f06f0
ZARINPAL_CALLBACK_URL=https://pay.avort.ir/api/payments/callback
```

OTP is sent through sms.ir using the server-only API key and template ID. Do not prefix these secrets with `VITE_`, and leave `TEST_OTP` empty in production. Rotate the API key after the key was exposed in chat. Payment routes are currently in test mode; configure and implement ZarinPal request/verify before accepting real payments.

The Vercel function is exposed at `/api/*`, and the frontend build is the normal Vite build.
