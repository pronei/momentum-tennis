# AGENTS.md — operating manual for agents (and humans)

Momentum Tennis academy platform: SvelteKit on Cloudflare Workers, Supabase Postgres
with RLS, Stripe, Resend. **Most players are minors** — that fact shapes every model
and every policy here.

## Status
Phase 0 (foundations) built on branch `phase-0/foundations`: scaffold, migration 0001 +
PGlite harness, generated types, auth + guards, domain patterns, design-system port
(core/forms/feedback), integration skeletons, CI. Phase plan and decisions: `docs/PLAN.md`.
Phase-0 checklist: `docs/superpowers/plans/2026-09-02-phase-0-foundations.md`.

## Prime directives
1. **Build only the approved phase.** Deliver, stop, wait for explicit approval.
   The phase plan lives in `docs/PLAN.md`; scope creep is a bug.
2. **Money, consent, minors: never guess policy.** When a decision touches one of
   these, surface it as a question with a recommended default.
3. **Append-only means append-only.** `credit_ledger`, `waiver_signatures`,
   `rating_events`, published `waiver_versions`, `audit_log`: no UPDATE, no DELETE —
   corrections are new rows. Never store a derivable balance.
4. **The database is the authority.** EXCLUDE constraints, unique weekly-cap
   indexes, capacity triggers, and RLS enforce the invariants. App code may
   pre-check for UX, but never "fixes" a conflict by weakening a constraint —
   map violations to friendly errors instead.
5. **Waiver and consent copy comes FROM LEGAL.** Never draft it; never claim
   legal sufficiency, e-signature validity, or compliance.
6. **Secrets never enter git, code, or committed env files.**
   `.env.development` / `.env.production` hold public values only; secrets live in
   `.env.local` (local) and Cloudflare project secrets (deployed).

## Design-system rules (binding — see design-system/readme.md)
- Tokens only: no raw hex, no off-scale px, fonts Chivo / IBM Plex Sans / IBM Plex
  Mono only. `_adherence.oxlintrc.json` encodes the rules; it and
  `_ds_manifest.json` are **compiler-generated — never hand-edit**.
- One radius (48px action pill), everything else square; flat, no shadows; amber is
  the present frame + the ONE primary CTA per view; `--state-error` is the only
  state color and is always dual-channel (color + mono `ERROR:` message); there is
  deliberately **no success color** (success = ink + mono confirmation line).
- No icons, no emoji, no exclamation points. Data strings (times, prices, counts,
  statuses, refs) are mono, uppercase. Tracking law: caps ≤22px 0.107em.
- One breakpoint (760px), 44px minimum targets, meaning never in color alone,
  `prefers-reduced-motion` honored.
- **Port contract:** `design-system/components/**/*.jsx` are reference
  implementations; the sibling `.d.ts` files are the props contracts. Port to
  Svelte 5 reproducing values verbatim; swap inline styles for classes but
  reproduce the layouts (design-system PRODUCT.md §11 sanctions this).

## Domain invariants
- **Time:** store `timestamptz` (UTC) everywhere. The academy timezone
  (America/Los_Angeles) lives in `academy_settings`. Recurring templates store
  LOCAL wall-clock values and expand per-date — never precompute UTC offsets.
- **Scoped class credits:** weekday packs redeem Mon–Fri, weekend packs Sat–Sun;
  hard cap of 1 class per scope per ISO week per player, enforced by a partial
  unique index, computed in the academy timezone. Credits are issued ONLY through
  `issue_credits()` (validity + forgiveness policy snapshot live there).
- **One forgiven skip per package:** the first late cancel or no-show on a pack
  writes a `forgive` ledger row; validity is extended a week per allowance.
  Ledger lookups are keyed on the BOOKING (`consume:class_booking:{id}`), never
  on the session — families may cancel and re-book the same occurrence.
- **Ball levels gate slots:** a player books only sessions tagged with their level
  (`session_skill_levels`); untagged = all levels. Parents set the level at
  profile creation; only staff change it afterwards.
- **Guardians pay, players consume.** Purchases attach to accounts; credits,
  bookings, waiver coverage, and ratings attach to named players. An adult player
  is a `self` guardianship — same shape, not a special case. Minority is derived
  from `birthdate` at the moment of the act, never stored as a flag.
- **Idempotency wherever money or email moves:** Stripe webhooks keyed on event
  id via `stripe_events`; ledger rows carry structural idempotency keys;
  notification sends dedupe on `trigger_key`.
- **RLS-first:** every table has policies; money/consent writes go through
  SECURITY DEFINER RPCs only; `/admin` routes are additionally authorized
  server-side in hooks. Assume the client is hostile.

## Environments
| | dev | prod |
|---|---|---|
| Cloudflare project | `momentumtennis-dev` | `momentumtennis` |
| Deploy branch | `deploy/dev` | `deploy/live` |
| Supabase project | dev project | prod project |
| Stripe | test mode | live mode |
| Secrets | CF project secrets · `.env.local` locally | CF project secrets |

Migrations apply dev-first, prod on release. Never point local dev at prod.
Never put real family data in dev.

## Working conventions
- TypeScript strict; Svelte 5 runes; pnpm.
- Layering: routes stay thin → `src/lib/server/domain/*` owns logic (one module
  per bounded context: identity, waivers, scheduling, booking, ledger, payments,
  ratings, notify) → data access through generated Supabase types
  (`pnpm db:types`; committed; never hand-edited).
- Validate every boundary input with zod schemas colocated in the domain module.
- Keep modules focused (roughly ≤300 lines); split before they sprawl. Small,
  well-bounded units are what make AI-driven change safe.
- Tests colocated (vitest); an e2e smoke per phase (playwright). A phase is done
  when checks pass and its `docs/PLAN.md` exit criteria are met.
- `supabase/migrations/*` are append-only — never edit an applied migration.
- Architecture/policy decisions get a dated note in `docs/decisions/`.
- Conventional commits; changes scoped to the current phase.
- When a convention here stops matching reality, update this file in the same
  change — a stale AGENTS.md is worse than none.

## Commands
| command | what it does |
|---|---|
| `pnpm dev` | Vite dev server (needs `.env.development` filled + `.env.local` secrets) |
| `pnpm check` | `svelte-kit sync` + `svelte-check` (types, a11y) — must be clean |
| `pnpm lint` | prettier check + eslint + design-system adherence (`scripts/check-adherence.mjs`) |
| `pnpm format` | prettier write |
| `pnpm test` | vitest: domain units, DS SSR contracts, and the PGlite schema harness |
| `pnpm db:test` | the schema harness alone (`supabase/tests/validate.mjs`) |
| `pnpm db:types` | regenerate `src/lib/server/db/database.types.ts` from `supabase/migrations` (CI verifies it is current) |
| `pnpm build` | adapter-cloudflare build into `.svelte-kit/cloudflare` |
| `pnpm test:e2e` | Playwright smoke against the built app (needs a reachable Supabase) |
| `supabase db push` | apply migrations (CI does this per deploy branch — `.github/workflows/migrate.yml`) |
| `wrangler deploy --env dev\|live` | manual deploy; normally Workers Builds deploys from the branch |

Development loop: write the failing test, watch it fail, implement, watch it pass
(`superpowers:test-driven-development`). Domain functions take the Supabase client as a
parameter and are tested with narrow fakes; DS components are tested via `svelte/server`
render; the schema is tested behaviorally in PGlite.

## Repo map
- `src/hooks.server.ts` — per-request RLS client, `safeGetSession`, route-group guards
  (`(portal)` needs a user, `/coach` staff, `/admin` admin).
- `src/lib/server/config.ts` (pure, tested) + `config.runtime.ts` ($env wiring) — one
  validated config; secrets only via `$env/dynamic/private`.
- `src/lib/server/db/` — `client.ts` (user-scoped), `admin.ts` (service role: webhooks,
  cron only), `database.types.ts` (generated).
- `src/lib/server/domain/` — `result.ts` (Result/AppError + Postgres → code mapping +
  the only copy for refusals), `time.ts` (academy-tz rendering mirroring SQL),
  `identity/` (staff roles, account profile), `booking/` (RPC wrappers), `cron.ts`
  (secret check + job dispatch), `payments/` (webhook idempotency port + Supabase
  store), `notify/` (transactional vs marketing send, insert-first idempotency).
- `src/lib/ds/` — ported design system (`index.ts` barrel; `core/ forms/ feedback/`);
  `FieldShell.svelte` is the shared form anatomy. `/styleguide` renders everything.
- `src/routes/` — `(auth)` login/signup, `auth/callback`, `logout`, `(portal)/portal`
  (shell + account form: the superforms pattern), `admin` (guarded shell),
  `internal/cron`, `api/stripe/webhook`.
- `supabase/` — `migrations/` (append-only), `seed.sql`, `tests/validate.mjs`, `config.toml`.
- `scripts/` — `gen-db-types.mjs`, `check-adherence.mjs`.
- `workers/cron/` — the scheduled Worker (Cron Triggers → `/internal/cron`).
- `design-system/` — Claude Design export: tokens (imported as `$ds`), JSX reference
  components, UI kits, email kit, PRODUCT.md. Media gitignored. Read-only reference.
- `docs/PLAN.md` — phases, exit criteria, decisions. `docs/superpowers/plans/` — phase
  checklists. `docs/decisions/` — ADRs.
