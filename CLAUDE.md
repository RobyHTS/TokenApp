# Reserve Your Token — CLAUDE.md

## Project Overview

**Reserve Your Token** is a full-stack hospital digital queue management web application. Hospitals can manage doctors and token queues; patients can book tokens online and track their position in real time.

**Live URL:** https://reserve-your-token.netlify.app
**GitHub:** https://github.com/RobyHTS/TokenApp
**Local dev:** http://localhost:3000

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) + TypeScript |
| Styling | Tailwind CSS v4 |
| ORM | Prisma v7 |
| Database (local) | PostgreSQL 16 (Homebrew) |
| Database (production) | Neon (neon.tech) — serverless PostgreSQL |
| Auth | Cookie-based sessions (no NextAuth) |
| Password hashing | bcryptjs |
| Charts | Recharts |
| Hosting | Netlify (via @netlify/plugin-nextjs) |

---

## Project Structure

```
reserve-your-token/
├── prisma/
│   ├── schema.prisma          # DB models
│   └── migrations/            # Migration history
├── prisma.config.ts           # Prisma v7 config (datasource URL for CLI)
├── netlify.toml               # Netlify build config
├── src/
│   ├── app/
│   │   ├── page.tsx           # Landing page
│   │   ├── layout.tsx         # Root layout
│   │   ├── globals.css        # Tailwind v4 global styles
│   │   ├── auth/
│   │   │   ├── hospital/login/page.tsx
│   │   │   ├── hospital/register/page.tsx
│   │   │   ├── patient/login/page.tsx
│   │   │   └── patient/register/page.tsx
│   │   ├── hospital/
│   │   │   ├── layout.tsx            # Auth guard (role=hospital)
│   │   │   ├── dashboard/page.tsx    # Stats + doctor list
│   │   │   ├── doctors/page.tsx      # Doctor list
│   │   │   ├── doctors/new/page.tsx  # Add doctor form
│   │   │   ├── doctors/[doctorId]/page.tsx          # Live token dashboard
│   │   │   ├── doctors/[doctorId]/settings/page.tsx # Doctor status & schedule
│   │   │   └── revenue/page.tsx      # Revenue analytics
│   │   ├── patient/
│   │   │   ├── layout.tsx            # Auth guard (role=patient)
│   │   │   ├── home/page.tsx         # Welcome + wallet + favourites
│   │   │   ├── book/page.tsx         # 3-step token booking flow
│   │   │   ├── tokens/page.tsx       # Active + history tokens
│   │   │   ├── favourites/page.tsx   # Saved doctors/hospitals
│   │   │   └── profile/
│   │   │       ├── page.tsx          # Profile view
│   │   │       └── wallet/page.tsx   # Wallet top-up + history
│   │   └── api/
│   │       ├── auth/hospital/login/route.ts
│   │       ├── auth/hospital/register/route.ts
│   │       ├── auth/patient/login/route.ts
│   │       ├── auth/patient/register/route.ts
│   │       ├── auth/logout/route.ts
│   │       ├── hospital/doctors/route.ts
│   │       ├── hospital/doctors/[doctorId]/route.ts
│   │       ├── hospital/doctors/[doctorId]/settings/route.ts
│   │       ├── hospital/doctors/[doctorId]/tokens/route.ts
│   │       ├── hospital/tokens/[tokenId]/status/route.ts
│   │       ├── hospital/revenue/route.ts
│   │       ├── hospitals/route.ts
│   │       ├── patient/tokens/route.ts
│   │       ├── patient/tokens/[tokenId]/cancel/route.ts
│   │       ├── patient/wallet/route.ts
│   │       └── patient/favourites/route.ts
│   ├── components/
│   │   ├── hospital/HospitalNav.tsx
│   │   ├── patient/PatientNav.tsx
│   │   └── ui/               # badge, button, card, input, label
│   ├── lib/
│   │   ├── db.ts             # Prisma client singleton
│   │   ├── session.ts        # Cookie session helpers
│   │   ├── auth.ts           # bcryptjs hash/verify
│   │   └── utils.ts          # cn(), status helpers, formatTime()
│   └── types/
│       └── index.ts
```

---

## Database Models (prisma/schema.prisma)

- **Hospital** — name, location, phone (unique), email (optional, unique), password
- **Doctor** — hospitalId, name, phone, specialization, image, status (DoctorStatus), estimatedReturn, tokenEnabled
- **DoctorSchedule** — doctorId, dayOfWeek (0=Sun…6=Sat), openTime, closeTime, maxPatientsPerDay, avgConsultMinutes, isActive
- **Patient** — name, phone (unique), image, password, walletBalance
- **Token** — doctorId, patientId (nullable), tokenNumber, status (TokenStatus), date, fee, isWalkIn, patientName, patientPhone
- **Transaction** — patientId, amount, type (CREDIT/DEBIT), description
- **Favorite** — patientId, hospitalId (nullable), doctorId (nullable)
- **Notification** — patientId, title, message, read

### Enums
- `DoctorStatus`: IN_OP, IN_IP, EMERGENCY, ON_LEAVE
- `TokenStatus`: PENDING, CURRENT, COMPLETED, CANCELLED, SKIPPED
- `TransactionType`: CREDIT, DEBIT

---

## Key Implementation Details

### Prisma v7 Breaking Changes
- `url` property is **removed** from the `datasource` block in `schema.prisma`. The datasource block only has `provider`.
- URL for CLI/migrations is set in `prisma.config.ts` via `datasource.url`.
- `datasources` constructor option is **removed** from `PrismaClient`. Must use a **driver adapter** instead.
- `db.ts` uses `@prisma/adapter-pg` (PrismaPg) with the DATABASE_URL:

```typescript
import { PrismaPg } from '@prisma/adapter-pg'
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
export const db = globalForPrisma.prisma ?? new PrismaClient({ adapter })
```

### Tailwind CSS v4 Breaking Changes
- No `@tailwind base/components/utilities` directives — use `@import "tailwindcss"` instead.
- `@apply border-border` does not work — use direct CSS: `border-color: hsl(var(--border))`.

### Session Auth
- Sessions stored as base64-encoded JSON in `session` cookie (httpOnly, sameSite: lax).
- `getSession()` in `src/lib/session.ts` reads and decodes the cookie.
- Session payload: `{ userId, role: 'hospital' | 'patient', name }`.
- Layout files (`hospital/layout.tsx`, `patient/layout.tsx`) are server components that call `getSession()` and redirect if unauthorized.

### Token Fee & Revenue
- Default token fee: ₹100, deducted from patient wallet on booking.
- Hospital revenue share: 30% of total token fees.

### Auto-Refresh
- Live token dashboard (`/hospital/doctors/[doctorId]/page.tsx`) polls every 15 seconds.

---

## Local Development Setup

```bash
# Prerequisites: PostgreSQL 16 via Homebrew
brew services start postgresql@16

# Install dependencies
npm install

# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev --name init

# Start dev server
npm run dev
```

**Local .env:**
```
DATABASE_URL="postgresql://Rabert@localhost:5432/reserve_token_db"
```

**Test Credentials (local DB):**
| Role | Phone | Password |
|---|---|---|
| Hospital | 9876543210 | password123 |
| Patient | 9123456789 | password123 |

Doctor: Dr. Arjun Kumar (General Medicine), schedule Mon–Sat 9am–5pm
Patient wallet pre-loaded: ₹500

---

## Production (Netlify + Neon)

**Netlify site:** https://app.netlify.com/projects/reserve-your-token
**Database:** Neon — `ep-wispy-silence-amesbofx-pooler.c-5.us-east-1.aws.neon.tech`

**Environment variable set on Netlify:**
- `DATABASE_URL` — Neon connection string (set via Netlify CLI, do not commit to git)

**Build command:** `npm run build` → runs `prisma generate && next build`
**Publish directory:** `.next`
**Plugin:** `@netlify/plugin-nextjs`

**Deploy:** Any `git push` to `main` auto-deploys via GitHub integration.

To manually deploy:
```bash
netlify deploy --prod
```

To run migrations on production DB:
```bash
DATABASE_URL="<neon-url>" npx prisma migrate deploy
```

---

## Common Commands

```bash
# Dev server
npm run dev

# Type check
npx tsc --noEmit

# Prisma studio (local DB browser)
npx prisma studio

# Push schema changes to local DB without migration file
npx prisma db push

# Create new migration
npx prisma migrate dev --name <name>

# Deploy migrations to production
DATABASE_URL="<neon-url>" npx prisma migrate deploy

# Manual production deploy
netlify deploy --prod

# Check Netlify status
netlify status
```

---

## Known Issues Fixed

1. **Prisma v7 `datasources` constructor removed** — fixed by using `@prisma/adapter-pg` driver adapter.
2. **Prisma v7 `url` in schema.prisma removed** — datasource block has no `url` field; URL lives in `prisma.config.ts` and passed via adapter at runtime.
3. **Tailwind v4 `@apply border-border` error** — replaced with direct CSS in `@layer base`.
4. **TypeScript error in `DoctorSchedule.createMany`** — explicit field mapping instead of spread of `Record<string, unknown>`.
5. **Recharts `Tooltip` formatter type** — removed explicit `number` type annotation; let TypeScript infer.
