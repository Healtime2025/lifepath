# LifePath

**Every learner has a path.**

LifePath is a production-oriented South African career-navigation application. It is designed to support young people from school subject choice through career discovery, verified training routes, funding and official applications — without assuming university is the only successful route.

This repository has **no mock API mode and no fake provider-verification mode**. Seeded public institutions are sourced from the official DHET public university and TVET directories. Private-provider, programme, qualification and funding records are designed to be imported and re-verified from current official sources before public launch.

## What is included

- Secure learner accounts with scrypt password hashing and database-backed sessions
- Password reset email integration (optional Resend)
- Learner profile, grade, subject and marks tracking
- AI-assisted report reading for JPG/PNG/WebP/PDF, with review before use
- LifePath Discovery assessment across six work-interest dimensions
- Deterministic career-matching engine (works even without AI)
- Career catalogue spanning professional, technical, artisan, administrative, service, health, creative, agriculture, public-service and entrepreneurial routes
- Verified institution/provider directory and **Check a provider** workflow
- Public university and TVET seed directory from DHET
- Programme/qualification data model with requirements, academic year and official application links
- Funding directory with official info/application links
- Application and deadline tracker
- Longitudinal progress timeline
- AI Career Coach grounded in the learner profile and LifePath database
- SchoolCore signed hand-off and marks synchronisation endpoint
- Admin data-import workflow for institutions/providers, qualifications, programmes and funding
- PWA manifest/service worker
- POPIA-minded privacy and data-minimisation design
- Account deletion API and audit trail

## Technology

- Next.js 16 / React 19 / TypeScript
- Neon Postgres via `@neondatabase/serverless`
- Plain responsive CSS (no UI framework lock-in)
- Optional OpenAI Responses API for career-coach explanations and report extraction
- Optional Resend REST API for password reset email

## Local setup

1. Create a Neon Postgres database.
2. Copy `.env.example` to `.env.local` and fill at minimum:
   - `DATABASE_URL`
   - `NEXT_PUBLIC_APP_URL`
   - `ADMIN_EMAILS`
3. Install dependencies:

```bash
npm install
```

4. Run schema migration:

```bash
npm run db:migrate
```

5. Seed the national public-institution directory, career catalogue and national funding starting records:

```bash
npm run db:seed
```

6. Start LifePath:

```bash
npm run dev
```

## Production environment

Set these in Vercel (or your hosting platform):

```text
DATABASE_URL
NEXT_PUBLIC_APP_URL=https://your-domain
ADMIN_EMAILS=your-admin-email
OPENAI_API_KEY=...            # optional but needed for AI coach/report reading
OPENAI_MODEL=gpt-5.6-luna    # configurable
RESEND_API_KEY=...            # optional; needed for reset email
EMAIL_FROM=LifePath <noreply@your-domain>
SCHOOLCORE_SHARED_SECRET=...  # if SchoolCore hand-off is enabled
```

Generate secrets with a cryptographically secure generator. Do not commit `.env.local`.

## Data truth and accreditation

LifePath should never invent an accreditation status, admission requirement, deadline or application URL. The code stores:

- verification status
- verification body
- registration number (when applicable)
- verification source URL
- verification date
- programme academic year
- programme source URL

The seeded verification sources are documented in `docs/DATA_GOVERNANCE.md`.

## Admin imports

An admin email listed in `ADMIN_EMAILS` becomes an admin on registration. Open `/admin` to import current authoritative records.

Supported import types:

- `institutions`
- `qualifications`
- `programmes`
- `funding`

The import is intentionally source-driven. LifePath does not turn an unverified web listing into a green “verified” badge.

## SchoolCore integration

See `docs/SCHOOLCORE_INTEGRATION.md`. SchoolCore can hand a learner into LifePath with signed learner profile and marks data. LifePath remains independently usable by learners whose schools do not use SchoolCore.

## Before public launch

Read `docs/LAUNCH_CHECKLIST.md`. In particular, load and validate current private-provider registers, current programme requirements and current funding/application dates. Public directories and operational data change over time.
