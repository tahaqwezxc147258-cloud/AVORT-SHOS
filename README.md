<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Run and deploy your AI Studio app

This repository contains the Noir Sneaker Store frontend (Vite + React + TypeScript)
and a minimal backend scaffold under the `server/` folder (Express + TypeScript + Prisma).

## Run Locally

Prerequisites: Node.js, PostgreSQL (or use another datasource and adjust `server/prisma/schema.prisma`)

1. Install frontend deps and run dev server:

```bash
npm install
npm run dev
```

2. Set frontend env (see `.env.example`) or set `VITE_API_URL` to your backend, e.g. `http://localhost:4000/api`.

3. Start the backend:

```bash
cd server
npm install
cp .env.example .env
# edit .env (DATABASE_URL, JWT_SECRET, optionally ZARINPAL_MERCHANT_ID)
npx prisma generate
npx prisma migrate dev --name init
npm run prisma:seed
npm run dev
```

Now open the frontend at `http://localhost:3000` and it will call the backend APIs.

## Run automated E2E smoke test (optional)

From the `server/` folder (server must be running on port 4000):

```bash
npm run test:e2e
```

This script will perform a quick end-to-end flow using the mock SMS (it reads OTP from the database), create a product as the seeded admin, add to cart as a regular user, create an order and verify the mock payment. Useful for smoke-testing local setup.
