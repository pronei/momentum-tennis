# Phase 0 — Foundations Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [x]`) syntax for tracking. Read `AGENTS.md` first — its rules override taste.

**Goal:** A deployable SvelteKit + Supabase + Cloudflare skeleton that carries the validated schema, working auth, the design-system port for core/forms/feedback, and the code patterns every later phase copies.

**Architecture:** Thin routes → `src/lib/server/domain/*` modules (zod at the boundary, typed `Result`/`AppError`, Supabase client injected) → Postgres RPCs/RLS as the authority. Design system imported from `design-system/` tokens (single styling truth) with Svelte 5 components in `src/lib/ds/` ported verbatim from the JSX reference. Harder integrations (Stripe webhook, cron, booking) are sketched as typed skeletons with the idempotency pattern in place.

**Tech Stack:** SvelteKit 2 / Svelte 5 (runes), `@sveltejs/adapter-cloudflare`, `@supabase/supabase-js` + `@supabase/ssr`, zod, sveltekit-superforms, vitest, playwright, `@electric-sql/pglite` (schema tests + local type generation), wrangler, GitHub Actions.

---

## File map (what lives where)

| Path | Responsibility |
|---|---|
| `supabase/migrations/0001_schema.sql` | the validated schema (moved from `docs/schema/schema-v2.sql`) |
| `supabase/seed.sql` | reference data: skill levels, locations, rating dimension, waiver doc |
| `supabase/tests/validate.mjs` | PGlite behavioral harness (74 checks) |
| `scripts/gen-db-types.mjs` | introspects the migration in PGlite → `src/lib/server/db/database.types.ts` |
| `scripts/check-adherence.mjs` | design-system adherence lint for app code (no raw hex / px) |
| `src/lib/server/config.ts` | zod-validated env (fails fast, names the missing var) |
| `src/lib/server/db/{client,admin}.ts` | typed Supabase clients: user-scoped (RLS) and service-role (webhooks/cron) |
| `src/lib/server/domain/result.ts` | `Result<T>` + `AppError` + Postgres/RPC error mapping |
| `src/lib/server/domain/time.ts` | academy-timezone formatting helpers (display only; DB is authority) |
| `src/lib/server/domain/identity/*` | account profile (phase 0), players/guardianships (phase 1) |
| `src/lib/server/domain/booking/*` | RPC wrappers + error mapping (sketch; UI in phase 4) |
| `src/lib/server/domain/payments/*` | Stripe webhook skeleton with `stripe_events` idempotency (phase 5 fills) |
| `src/lib/server/domain/notify/*` | `notification_sends` insert-first send pattern (phase 7 fills) |
| `src/hooks.server.ts` | Supabase SSR client per request, `safeGetSession`, portal/admin guards |
| `src/routes/(auth)/*` | login, signup, logout, callback |
| `src/routes/(portal)/*` | authed shell + account profile form (the superforms exemplar) |
| `src/routes/admin/*` | server-guarded shell |
| `src/routes/styleguide/*` | design-system gallery (dev aid) |
| `src/routes/internal/cron/+server.ts` | shared-secret endpoint the cron worker calls |
| `src/routes/api/stripe/webhook/+server.ts` | raw-body webhook receiver → domain/payments |
| `src/lib/ds/*` | ported components, grouped like the source (`core/ forms/ feedback/`) |
| `workers/cron/*` | separate wrangler worker with Cron Triggers |
| `wrangler.toml`, `.github/workflows/*` | deploy config, CI |

## Tasks

### Task 1: Scaffold + tooling
- [x] `npx sv create` (minimal, ts) → copy into repo root; add adapter-cloudflare
- [x] `package.json` scripts: dev/build/preview/check/lint/format/test/test:e2e/db:types/ds:check
- [x] ESLint flat config (svelte + ts), Prettier (+svelte plugin), vitest, playwright configs
- [x] `pnpm install`; `pnpm check` and `pnpm build` green
- [x] Commit: `chore: sveltekit scaffold with cloudflare adapter and tooling`

### Task 2: Database artifacts
- [x] Move schema → `supabase/migrations/0001_schema.sql`; split seed → `supabase/seed.sql`
- [x] `supabase/config.toml` (minimal), `supabase/tests/validate.mjs` (path updated)
- [x] `scripts/gen-db-types.mjs` → `src/lib/server/db/database.types.ts` (committed)
- [x] vitest wraps the harness (`supabase/tests/schema.test.ts`) — must pass
- [x] Commit: `feat(db): migration 0001, seed, local type generation, schema test`

### Task 3: Server foundations (TDD)
- [x] `config.ts` test → impl; `result.ts` tests (error mapping for `weekly_cap:`, `waiver_required`, exclusion) → impl
- [x] `time.ts` tests (academy tz formatting, ISO week) → impl
- [x] `db/client.ts`, `db/admin.ts`, `hooks.server.ts`, `app.d.ts` locals
- [x] Commit: `feat(server): config, result/error mapping, time helpers, supabase clients, hooks`

### Task 4: Auth + shells
- [x] `(auth)/login`, `signup`, `logout`, `auth/callback`; `(portal)/+layout.server.ts` guard; `admin/+layout.server.ts` staff guard
- [x] `(portal)/account` profile form with superforms + zod → `domain/identity/account.ts`
- [x] Commit: `feat(auth): supabase ssr auth, portal and admin shells, account profile exemplar`

### Task 5: Design-system port (core → forms → feedback)
- [x] `$ds` alias → `design-system/`; root layout imports `$ds/styles.css`
- [x] Port with SSR smoke tests: Button, Eyebrow, FrameTicks, TextField, FormSection, Select, Checkbox, SegmentedControl, TextArea, Banner, StatusChip, EmptyState, Tabs, Dialog, Toast, Pagination, DateField, TimeField
- [x] `/styleguide` renders every component in every variant
- [x] `scripts/check-adherence.mjs` wired into `pnpm lint`
- [x] Commit per group: `feat(ds): port core components` / `forms` / `feedback`

### Task 6: Integration sketches
- [x] `domain/booking/{index,errors}.ts` — typed RPC wrappers (`bookClass`, `cancelBooking`) + tests of error mapping
- [x] `domain/payments/webhook.ts` — signature verify (async), `stripe_events` insert-first, dispatch table; `api/stripe/webhook/+server.ts`
- [x] `domain/notify/send.ts` — `notification_sends` insert-first + Resend call
- [x] `internal/cron/+server.ts` + `workers/cron/` (wrangler.toml with crons, fetch with `CRON_SHARED_SECRET`)
- [x] Commit: `feat: integration skeletons — stripe webhook, cron endpoint + worker, notify`

### Task 7: Deploy config + CI
- [x] `wrangler.toml` (nodejs_compat, assets, `[env.dev]` / `[env.live]`)
- [x] `.github/workflows/ci.yml` (check, lint, test, build) and `migrate.yml` (supabase db push on deploy branches)
- [x] README/AGENTS: commands are real now; document the deploy flow
- [x] Commit: `chore: wrangler config and CI workflows`

### Exit criteria (from docs/PLAN.md)
`pnpm check`, `pnpm lint`, `pnpm test`, `pnpm build` all green; both deployments can be created from the branch; migration applied via CI; DS components render on `/styleguide`.

## Status (end of session 2026-09-02)
Done: Tasks 1–7 code-side. `pnpm check`, `pnpm lint`, `pnpm test` (62 unit/contract + schema harness), `pnpm build` green.
Not done (needs operator access, not code):
- [ ] Create Supabase projects (dev Free, prod Pro before phase 5); fill `.env.development` / `.env.production` public values; secrets in `.env.local` and CF project secrets
- [ ] Create Cloudflare Workers projects `momentum-tennis-dev` (branch `deploy/dev`) and `momentum-tennis` (branch `deploy/live`) via Workers Builds; set secrets; protect dev with Cloudflare Access
- [ ] Deploy `workers/cron` per environment with `APP_URL` var + `CRON_SHARED_SECRET` secret
- [x] GitHub repository secret for `.github/workflows/migrate.yml` — `SUPABASE_DB_PASSWORD_DEV` (2026-09-03; the workflow needs nothing else)
- [ ] Run `pnpm test:e2e` once a dev Supabase exists (auth pages, guards)
Deferred by design: DS ports of PhotoFrame, StrobeArc, Wordmark, SiteNav, CourtMeter, ProgramCard, timelines, DataTable, RatingMeter, ResourceDayView, SessionForm — each lands with the phase that first renders it.
