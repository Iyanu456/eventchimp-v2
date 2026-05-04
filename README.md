# EventChimp

EventChimp is a full-stack event platform for publishing events, selling tickets, managing organizers, handling payouts, and running event operations from a modern dashboard.

The app is split into two main parts:

- `frontend/`: Next.js App Router, React, TypeScript, Tailwind CSS, TanStack Query, Zustand
- `backend/`: Express, TypeScript, MongoDB, BullMQ, Redis, Paystack, Resend, Swagger

The frontend does not use Next.js API routes as the main backend. Product logic lives in the Express API and is consumed through a shared frontend API service layer.

## What The App Covers

EventChimp currently includes:

- public landing page and event discovery
- event detail pages with checkout
- free and paid ticket acquisition flows
- organizer dashboard and event management
- payout profile setup for organizers
- admin overview pages
- QR-based ticket generation and scanning foundations
- Paystack-backed payment verification
- BullMQ-backed async jobs
- Swagger API docs

## Monorepo Structure

```text
eventchimp-v2/
├─ frontend/
│  ├─ public/
│  ├─ src/app/
│  ├─ src/apiServices/
│  ├─ src/components/
│  ├─ src/hooks/
│  ├─ src/lib/
│  ├─ src/stores/
│  └─ src/types/
├─ backend/
│  ├─ src/config/
│  ├─ src/controllers/
│  ├─ src/middleware/
│  ├─ src/models/
│  ├─ src/routes/
│  ├─ src/services/
│  ├─ src/utils/
│  └─ src/validators/
├─ docker-compose.backend.yml
├─ package.json
└─ pnpm-workspace.yaml
```

## Core Tech Choices

### Frontend

- Next.js 14 App Router
- React 18
- TypeScript
- Tailwind CSS
- TanStack Query
- Zustand
- Axios

### Backend

- Express
- TypeScript
- MongoDB with Mongoose
- Redis + BullMQ
- JWT auth
- Google OAuth
- Paystack payments
- Resend email delivery
- Cloudinary media support
- Swagger docs

## Important Application URLs

### Frontend routes

- `/`
- `/events`
- `/events/[slug]`
- `/events/[slug]/checkout`
- `/checkout/success`
- `/login`
- `/signup`
- `/dashboard`
- `/dashboard/events`
- `/dashboard/events/new`
- `/dashboard/events/[id]`
- `/dashboard/events/[id]/scanner`
- `/dashboard/analytics`
- `/dashboard/settings`
- `/dashboard/tickets`
- `/dashboard/transactions`
- `/dashboard/payouts`
- `/dashboard/branding`
- `/admin`
- `/admin/events`
- `/admin/users`
- `/admin/transactions`
- `/invitations/[token]`
- `/verify-ticket/[token]`

### Backend route groups

- `/api/auth`
- `/api/events`
- `/api/payments`
- `/api/checkout`
- `/api/tickets`
- `/api/dashboard`
- `/api/organizer`
- `/api/refunds`
- `/api/branding`
- `/api/admin`
- `/api/docs`
- `/api/health`

## Prerequisites

Install these before running the app:

- Node.js 20 or newer
- `pnpm` 10 or newer
- MongoDB
- Redis

Optional but needed for full production behavior:

- Paystack account
- Resend account
- Cloudinary account
- Google OAuth credentials

## Local Setup

### 1. Install dependencies

```bash
pnpm install
```

### 2. Create environment files

Frontend:

```bash
cp frontend/.env.example frontend/.env.local
```

Backend:

```bash
cp backend/.env.example backend/.env
```

### 3. Update environment variables

#### Frontend env

`frontend/.env.local`

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:4000/api
```

#### Backend env

`backend/.env`

Required:

- `MONGODB_URI`
- `JWT_SECRET`

Commonly important:

- `PORT`
- `NODE_ENV`
- `CLIENT_URL`
- `REDIS_URL`
- `JWT_EXPIRES_IN`
- `SEED_ON_BOOT`

Payment and email:

- `PAYSTACK_SECRET_KEY`
- `PAYSTACK_WEBHOOK_SECRET`
- `PAYSTACK_PUBLIC_KEY`
- `PAYSTACK_CALLBACK_URL`
- `RESEND_API_KEY`
- `EMAIL_FROM` or `RESEND_FROM_EMAIL`

Media and auth:

- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `GOOGLE_REDIRECT_URI`

### 4. Start the app

Run frontend and backend together:

```bash
pnpm dev
```

This uses the workspace root script and starts:

- frontend on `http://localhost:3000`
- backend on `http://localhost:4000`

### 5. Open the app

- frontend: `http://localhost:3000`
- backend health: `http://localhost:4000/api/health`
- swagger docs: `http://localhost:4000/api/docs`

## Workspace Scripts

At the repo root:

```bash
pnpm dev
pnpm build
pnpm typecheck
```

Package-specific examples:

```bash
pnpm --filter eventchimp-frontend dev
pnpm --filter eventchimp-frontend build
pnpm --filter eventchimp-backend dev
pnpm --filter eventchimp-backend build
pnpm --filter eventchimp-backend typecheck
```

## Seeded Demo Accounts

When `SEED_ON_BOOT=true`, the backend seeds sample users and events if the database does not already contain event data.

- organizer: `organizer@eventchimp.com` / `Password123!`
- attendee: `attendee@eventchimp.com` / `Password123!`
- admin: `admin@eventchimp.com` / `Password123!`

For production, set `SEED_ON_BOOT=false`.

## Frontend Architecture Notes

The frontend uses a service-layer structure instead of putting API requests directly in pages and components.

Key folders:

- `frontend/src/apiServices/base-urls.ts`
- `frontend/src/apiServices/routes.ts`
- `frontend/src/apiServices/crud-requests.ts`
- `frontend/src/apiServices/requests.ts`
- `frontend/src/hooks/queries`
- `frontend/src/hooks/mutations`

Conventions:

- server state goes through TanStack Query
- lightweight auth/session state goes through Zustand
- UI components consume hooks and typed request helpers
- payment totals are computed on the backend, not trusted from the client

## Backend Architecture Notes

The backend follows a layered structure:

- `routes`: route registration
- `controllers`: request/response handlers
- `services`: core business logic
- `models`: Mongoose schemas
- `validators`: Zod validation
- `middleware`: auth, error handling, etc.
- `config`: environment, DB, Swagger, CORS
- `utils`: shared helpers

Operational behavior:

- MongoDB stores product data
- Redis powers BullMQ queues
- webhook processing and ticket issuance are async-safe
- paid checkout verification is server-side
- ticket issuance and financial records are handled by backend services

## Backend Docker

The backend is dockerized for portable deployment.

### Files

- [Dockerfile](C:/Users/IYANUOLUWA/Documents/React/eventchimp-v2/backend/Dockerfile)
- [docker-compose.backend.yml](C:/Users/IYANUOLUWA/Documents/React/eventchimp-v2/docker-compose.backend.yml)
- [backend/.env.docker.example](C:/Users/IYANUOLUWA/Documents/React/eventchimp-v2/backend/.env.docker.example)
- [backend/.env.docker](C:/Users/IYANUOLUWA/Documents/React/eventchimp-v2/backend/.env.docker)

### Run the backend stack with Docker

```bash
docker compose -f docker-compose.backend.yml up --build
```

This starts:

- backend
- MongoDB
- Redis

Stop it with:

```bash
docker compose -f docker-compose.backend.yml down
```

### Build backend image only

```bash
docker build -f backend/Dockerfile -t eventchimp-backend ./backend
```

## Deployment Notes

### Backend deployment

To deploy the backend anywhere, provide these environment variables at minimum:

- `NODE_ENV=production`
- `PORT`
- `MONGODB_URI`
- `REDIS_URL`
- `CLIENT_URL`
- `JWT_SECRET`

Then add the optional integrations you intend to use:

- Paystack
- Resend
- Cloudinary
- Google OAuth

For production:

- set `SEED_ON_BOOT=false`
- use a strong `JWT_SECRET`
- use a managed MongoDB instance
- use a managed Redis instance
- make sure `CLIENT_URL` points to your real frontend domain
- make sure `PAYSTACK_CALLBACK_URL` points to the real checkout success path

### Frontend deployment

For frontend deployment, set:

```env
NEXT_PUBLIC_API_BASE_URL=https://your-backend-domain/api
```

## Verification Commands

Use these before shipping changes:

```bash
pnpm typecheck
pnpm build
```

You can also run the backend checks directly:

```bash
pnpm --filter eventchimp-backend typecheck
pnpm --filter eventchimp-backend build
```

## Troubleshooting

### Frontend cannot reach backend

Check:

- `frontend/.env.local`
- backend is running on port `4000`
- `NEXT_PUBLIC_API_BASE_URL` points to `/api`

### Login or session issues

Check:

- `JWT_SECRET`
- frontend and backend URLs
- browser local storage for stale tokens

### Queue jobs not processing

Check:

- `REDIS_URL`
- Redis is reachable
- backend process started queue workers successfully

### Payments not verifying

Check:

- `PAYSTACK_SECRET_KEY`
- `PAYSTACK_CALLBACK_URL`
- `CLIENT_URL`
- webhook delivery configuration

### Emails not sending

Check:

- `RESEND_API_KEY`
- `EMAIL_FROM` or `RESEND_FROM_EMAIL`

### Google auth not working

Check:

- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `GOOGLE_REDIRECT_URI`
- authorized redirect URIs in Google Cloud Console

## Security Notes

- Never commit real `.env` files with live secrets.
- Keep `JWT_SECRET`, Paystack keys, Resend keys, and OAuth secrets private.
- Use production database and Redis credentials only through env vars.
- Replace placeholder credentials before any public deployment.

## Current Status

The codebase is already structured for:

- local development
- backend Docker deployment
- API-first frontend integration
- progressive feature expansion across organizer, admin, payment, and ticketing flows

The main things you typically configure per environment are:

- URLs
- database
- Redis
- auth secrets
- payment/email/media providers
