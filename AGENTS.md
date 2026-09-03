# AGENTS.md — operating manual for agents (and humans)

Momentum Tennis academy platform: SvelteKit on Cloudflare Workers, Supabase Postgres
with RLS, Stripe, Resend. **Most players are minors** — that fact shapes every model
and every policy here.

## Status
Phases 0–2 are built and merged to `main` (foundations, identity & profiles, waivers); `deploy/dev`
tracks `main`. Migrations 0001–0006 (0005 reference data, 0006 RLS safety net) are applied to the
dev Supabase project. The restricted minor login is deliberately NOT built — see open question O in
`docs/PLAN.md`. Phase 3 (schedule & availability) is next: `docs/HANDOFF-opus5.md` scopes phases
3–7 and the per-phase ritual. Phase plan and decisions: `docs/PLAN.md`. Phase checklists:
`docs/superpowers/plans/`. Operator state and runbook: `docs/OPERATIONS.md`.

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
   `.env.local` (local) and Cloudflare project secrets (deployed). Integration secrets
   are demanded where they are used (`requireSecret`, `secretOr503`), never at startup:
   an environment must not need a Stripe key to render the login page.

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
- **Identity writes are RPCs.** `players` and `guardianships` have no write policies:
  `create_player`, `update_player`, `archive_player`, `set_player_level` are the only
  mutations. Archiving ends the link and keeps the row; it is refused once the player has
  credits or bookings. No account may end up self-guarding a minor — `create_player` and
  `update_player` both enforce it.
- **The academy always has an admin.** Deleting the last `admin` row is refused (0003):
  it would leave nobody able to grant the role back.
- **Consent is versioned and append-only.** Publishing freezes a version and makes every
  earlier signature stop satisfying the gate; `v_player_waiver_status` and
  `assert_waivers_signed()` are the single truth the portal and booking both read. Version
  numbers and `content_sha256` are produced in SQL (0004), never by the app.
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
| Cloudflare project | `momentum-tennis-dev` | `momentum-tennis` |
| Deploy branch | `deploy/dev` | `deploy/live` |
| Supabase project | dev project | prod project |
| Stripe | test mode | live mode |
| Secrets | CF project secrets · `.env.local` locally | CF project secrets |

Each environment has a profile in `config/` (`dev.yaml`, `prod.yaml`): Supabase project,
Cloudflare workers, deploy branch, Stripe mode, and the NAMES of its secrets — never
values. `pnpm env:check` binds the profile to its env file so the two cannot drift.

Migrations apply dev-first, prod on release. Never point local dev at prod.
Never put real family data in dev.

## Working conventions
- Editing discipline: edit files surgically, never rewrite a file to change a part of it; choose an
  approach and commit to it — revisit only when new information contradicts the reasoning; add no
  validation scripts beyond the existing gates unless one is critical; write literally — when a
  plain phrase exists, use it.
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
| `pnpm env:check` | verify `config/*.yaml` against the committed env files (leak guard: refuses if a secret has a value in a committed file) |
| `pnpm db:types` | regenerate `src/lib/server/db/database.types.ts` from `supabase/migrations` (CI verifies it is current) |
| `pnpm db:push <profile>` | apply `supabase/migrations` to that environment's database directly — password from `.env.local`, project ref and pooler from `config/<profile>.yaml`; no `supabase login`. The Supabase GitHub integration applies them on push to `deploy/dev`; `migrate.yml` (manual) runs this command as the fallback |
| `pnpm build` | adapter-cloudflare build into `.svelte-kit/cloudflare` (bakes `.env.production`) |
| `pnpm build:dev` / `pnpm build:live` | the same build with a profile's public values and `deploy.site_url` — what Workers Builds runs |
| `pnpm cf …` | wrangler scoped to this repo's Cloudflare account: login state in `.wrangler/home` (gitignored), never the machine-wide login — `pnpm cf login`, `pnpm cf whoami`, `pnpm cf deploy --env dev` |
| `pnpm test:e2e` | Playwright smoke against the built app (needs a reachable Supabase) |
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
  `settings.ts` (academy timezone, fails soft), `identity/` (staff roles + console,
  account profile, players, age mirroring `player_is_adult()`), `booking/` (RPC
  wrappers), `waivers.ts` (documents, versions, status, signing), `cron.ts` (secret check
  + job dispatch), `payments/` (webhook idempotency
  port + Supabase store), `notify/` (transactional vs marketing send, insert-first
  idempotency).
- `src/lib/components/` — app composites built from `$lib/ds` and the design system's
  `ui_kits` references (`PlayerSwitcher`, `Card`), tested as SSR contracts.
- `src/lib/ds/` — ported design system (`index.ts` barrel; `core/ forms/ feedback/`);
  `FieldShell.svelte` is the shared form anatomy. `/styleguide` renders everything.
- `src/routes/` — `(auth)` login/signup, `auth/callback`, `logout`, `(portal)/portal`
  (shell carrying the `?player=` context, overview, `players/` roster + new + `[id]`,
  `waivers/` status + `[versionId]` signing, account form: the superforms pattern),
  `admin` (guarded shell, `waivers/`, `staff/`), `internal/cron`, `api/stripe/webhook`.
- `supabase/` — `migrations/` (append-only), `seed.sql`, `tests/validate.mjs`, `config.toml`.
- `config/` — one profile per environment (`dev.yaml`, `prod.yaml`); `docs/OPERATIONS.md` is
  the operator runbook (accounts, secrets, one-time links).
- `scripts/` — `gen-db-types.mjs`, `check-adherence.mjs`, `check-env.mjs`, `build-env.mjs`
  (+ `lib/env-file.mjs` shared by the last two).
- `workers/cron/` — the scheduled Worker (Cron Triggers → `/internal/cron`).
- `design-system/` — Claude Design export: tokens (imported as `$ds`), JSX reference
  components, UI kits, email kit, PRODUCT.md. Media gitignored. Read-only reference.
- `docs/PLAN.md` — phases, exit criteria, decisions. `docs/superpowers/plans/` — phase
  checklists. `docs/decisions/` — ADRs.
