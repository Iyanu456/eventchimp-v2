# EventChimp MVP

EventChimp is a premium event experience platform built as a real split-stack application:

- `frontend/`: Next.js App Router, React, TypeScript, Tailwind CSS, TanStack Query, Zustand
- `backend/`: Express, TypeScript, MongoDB/Mongoose, JWT auth, Swagger/OpenAPI

The frontend does not use Next.js API routes as its main backend. All business logic lives in the Express API and is consumed from a centralized frontend API service layer.

## Folder Structure

```text
eventchimp-v2/
├─ frontend/
│  ├─ src/app
│  ├─ src/apiServices
│  ├─ src/components
│  ├─ src/hooks
│  ├─ src/lib
│  ├─ src/stores
│  └─ src/types
├─ backend/
│  ├─ src/config
│  ├─ src/controllers
│  ├─ src/middleware
│  ├─ src/models
│  ├─ src/routes
│  ├─ src/services
│  ├─ src/utils
│  └─ src/validators
└─ package.json
```

## Frontend API Architecture

The frontend follows the required service-layer architecture:

- `frontend/src/apiServices/base-urls.ts`
- `frontend/src/apiServices/routes.ts`
- `frontend/src/apiServices/token-service.ts`
- `frontend/src/apiServices/crud-requests.ts`
- `frontend/src/apiServices/requests.ts`
- feature query hooks under `frontend/src/hooks/queries`
- mutation hooks under `frontend/src/hooks/mutations`

Rules enforced in this checkpoint:

- no direct `fetch` or `axios` calls inside UI pages/components
- server state stays in React Query
- Zustand is limited to session and lightweight global state
- all checkout pricing is backend-computed

## Backend Architecture

The Express backend uses layered modules:

- `routes`
- `controllers`
- `services`
- `models`
- `middleware`
- `validators`
- `utils`
- `config`

Included foundations:

- JWT auth
- Google OAuth initiation and callback exchange flow
- event CRUD and discovery
- organizer dashboard APIs
- admin foundation APIs
- ticket checkout initialization and verification flow
- Paystack, Resend, and Cloudinary service abstractions
- Swagger docs at `/api/docs`

## Routes Included

Frontend routes:

- `/`
- `/events`
- `/events/[slug]`
- `/login`
- `/signup`
- `/dashboard`
- `/dashboard/events`
- `/dashboard/events/new`
- `/dashboard/events/[id]`
- `/dashboard/branding`
- `/admin`
- `/admin/events`
- `/admin/users`
- `/admin/transactions`

Backend route groups:

- `/api/auth`
- `/api/events`
- `/api/tickets`
- `/api/checkout`
- `/api/dashboard`
- `/api/branding`
- `/api/admin`
- `/api/docs`

## Setup

1. Copy env files:

```bash
cp frontend/.env.example frontend/.env.local
cp backend/.env.example backend/.env
```

2. Update backend secrets:

- `MONGODB_URI`
- `JWT_SECRET`
- optional Paystack keys
- optional Resend key
- optional Cloudinary keys
- optional Google OAuth keys

3. Install dependencies:

```bash
pnpm install
```

4. Run the app:

```bash
pnpm dev
```

5. Open:

- frontend: `http://localhost:3000`
- backend health: `http://localhost:4000/api/health`
- swagger docs: `http://localhost:4000/api/docs`

## Seeded Demo Accounts

When `SEED_ON_BOOT=true`, the backend seeds sample users and events if the events collection is empty.

- organizer: `organizer@eventchimp.com` / `Password123!`
- attendee: `attendee@eventchimp.com` / `Password123!`
- admin: `admin@eventchimp.com` / `Password123!`

## Verification

This checkpoint passes:

```bash
pnpm typecheck
pnpm build
```

## Current MVP Coverage

Implemented now:

- premium marketing site
- centralized frontend API service layer
- auth foundations with Google OAuth endpoints
- current-user bootstrap flow
- public event discovery and detail
- organizer dashboard foundation
- branding metadata foundation
- admin overview foundations
- Swagger/OpenAPI docs

Structured for next phases:

- full Paystack webhook completion
- richer ticket lifecycle UI
- richer guest check-in operations
- deeper admin tooling
- richer branding asset export pipeline
