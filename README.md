# EventChimp

EventChimp is a full-stack event platform for publishing events, selling tickets, managing organizers, handling payouts, and running event operations from a modern dashboard.

The application is split into two main packages:

- `frontend/`: Next.js App Router, React, TypeScript, Tailwind CSS, TanStack Query, Zustand
- `backend/`: Express, TypeScript, MongoDB, BullMQ, Redis, Paystack, Resend, Swagger

The frontend is API-first. Business logic lives in the Express backend and is consumed from a shared frontend service layer.

## What The App Covers

EventChimp currently includes:

- public landing and event discovery
- event detail pages and checkout
- free and paid ticket acquisition
- organizer dashboard and event management
- payout profile setup
- ticket generation and QR foundations
- admin overview pages
- Paystack-based payment verification
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
│  ├─ src/validators/
│  ├─ Dockerfile
│  ├─ docker-compose.yml
│  └─ .env.docker.example
├─ package.json
└─ pnpm-workspace.yaml
```

## Tech Stack

### Frontend

- Next.js 14
- React 18
- TypeScript
- Tailwind CSS
- Axios
- TanStack Query
- Zustand

### Backend

- Express
- TypeScript
- MongoDB with Mongoose
- Redis + BullMQ
- JWT auth
- Google OAuth
- Paystack
- Resend
- Cloudinary
- Swagger

## Key Routes

### Frontend

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

### Backend

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

Install these locally before running the app outside Docker:

- Node.js 20+
- `pnpm` 10+
- MongoDB
- Redis

Optional integrations for full feature coverage:

- Paystack
- Resend
- Cloudinary
- Google OAuth

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

### 3. Configure environment variables

#### Frontend

`frontend/.env.local`

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:4000/api
```

#### Backend

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

Payments and email:

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

### 4. Run the app

Run the whole workspace:

```bash
pnpm dev
```

This starts:

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

## Architecture Notes

### Frontend

The frontend uses a service-layer structure instead of putting API requests directly in UI files.

Important folders:

- `frontend/src/apiServices/base-urls.ts`
- `frontend/src/apiServices/routes.ts`
- `frontend/src/apiServices/crud-requests.ts`
- `frontend/src/apiServices/requests.ts`
- `frontend/src/hooks/queries`
- `frontend/src/hooks/mutations`

Conventions:

- server state flows through TanStack Query
- auth/session state stays lightweight in Zustand
- components consume typed request helpers and hooks
- payment totals are backend-computed

### Backend

The backend uses a layered structure:

- `routes`
- `controllers`
- `services`
- `models`
- `validators`
- `middleware`
- `config`
- `utils`

Operationally:

- MongoDB stores product data
- Redis powers BullMQ queues
- webhook processing and ticket issuance are async-safe
- payment verification is server-side
- ticketing and finance logic live in backend services

## Backend Docker

The backend Docker setup now lives entirely inside `backend/`, so you can run it from that directory directly.

### Files

- [Dockerfile](C:/Users/IYANUOLUWA/Documents/React/eventchimp-v2/backend/Dockerfile)
- [docker-compose.yml](C:/Users/IYANUOLUWA/Documents/React/eventchimp-v2/backend/docker-compose.yml)
- [backend/.env.docker.example](C:/Users/IYANUOLUWA/Documents/React/eventchimp-v2/backend/.env.docker.example)
- [backend/.env.docker](C:/Users/IYANUOLUWA/Documents/React/eventchimp-v2/backend/.env.docker)

### Run the backend stack with Docker

```bash
cd backend
docker compose up --build
```

This starts:

- backend
- MongoDB
- Redis

Stop it with:

```bash
cd backend
docker compose down
```

Remove volumes too:

```bash
cd backend
docker compose down -v
```

### Build the backend image only

```bash
cd backend
docker build -t eventchimp-backend .
```

## Deployment Notes

### Backend deployment

To deploy the backend anywhere, provide at minimum:

- `NODE_ENV=production`
- `PORT`
- `MONGODB_URI`
- `REDIS_URL`
- `CLIENT_URL`
- `JWT_SECRET`

Then add any integrations you use:

- Paystack
- Resend
- Cloudinary
- Google OAuth

For production:

- set `SEED_ON_BOOT=false`
- use a strong `JWT_SECRET`
- use managed MongoDB and Redis
- point `CLIENT_URL` at the real frontend
- point `PAYSTACK_CALLBACK_URL` at the real success URL

### Frontend deployment

Set:

```env
NEXT_PUBLIC_API_BASE_URL=https://your-backend-domain/api
```

## Verification

Use these before shipping:

```bash
pnpm typecheck
pnpm build
```

Backend-only checks:

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
- frontend/backend URLs
- browser local storage for stale tokens

### Queue jobs are not processing

Check:

- `REDIS_URL`
- Redis is reachable
- backend workers started successfully

### Payments are not verifying

Check:

- `PAYSTACK_SECRET_KEY`
- `PAYSTACK_CALLBACK_URL`
- `CLIENT_URL`
- webhook delivery setup

### Emails are not sending

Check:

- `RESEND_API_KEY`
- `EMAIL_FROM` or `RESEND_FROM_EMAIL`

### Google auth is not working

Check:

- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `GOOGLE_REDIRECT_URI`
- redirect URIs configured in Google Cloud Console

### Docker cannot start

Check:

- Docker Desktop is running
- the Docker daemon is healthy
- `backend/.env.docker` exists

Then run:

```bash
cd backend
docker compose config
docker compose up --build
```

## Security Notes

- Never commit real `.env` files with live secrets.
- Keep `JWT_SECRET`, Paystack keys, Resend keys, and OAuth secrets private.
- Use environment variables for all production credentials.
- Replace placeholder values before deploying publicly.

## Current Status

The codebase is already structured for:

- local development
- backend Docker deployment
- API-first frontend integration
- progressive expansion across organizer, admin, payment, and ticketing flows

The main things you usually configure per environment are:

- URLs
- database
- Redis
- auth secrets
- payment, email, media, and OAuth providers
