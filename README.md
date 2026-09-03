# Momentum Tennis — academy platform

Web platform for [Momentum Tennis](https://momentum-tennis.com) (Cupertino, CA):
programs and scheduling across De Anza College and Murdock Park, guardian/player
accounts, versioned waivers, credit-based class and lesson booking, payments,
coach tools, and notifications.

**Status: phase 0 (foundations) built** — scaffold, validated schema + generated types,
auth, domain patterns, design-system port, integration skeletons, CI. Phases and decisions:
[docs/PLAN.md](docs/PLAN.md). Contributor and agent rules: [AGENTS.md](AGENTS.md).

## Stack
- **SvelteKit** (Svelte 5) + `@sveltejs/adapter-cloudflare` → Cloudflare Workers
- **Supabase Postgres** — all transactional data, RLS enforced; SECURITY DEFINER
  RPCs for money/consent writes; EXCLUDE constraints against double-booking
- **Stripe** — ACH-first + cards, Apple Pay, Google Pay, Cash App Pay, Link;
  idempotent webhooks feeding an append-only credit ledger
- **Resend** — transactional + newsletter email (templates in
  `design-system/templates/email/`)
- **Cloudflare Cron Triggers** — via a small dedicated worker (`workers/cron/`,
  planned), since the stock adapter exposes no `scheduled()` handler
- **Design system** — `design-system/` (Claude Design export): CSS custom-property
  tokens and JSX reference components, ported to Svelte in-repo. No third-party
  UI component libraries, ever.

## Repository layout
    src/               SvelteKit app — hooks, lib/server (config, db, domain), lib/ds (design-system port), routes
    supabase/          migrations (append-only), seed.sql, tests/validate.mjs (PGlite harness), config.toml
    scripts/           gen-db-types.mjs (types from migrations), check-adherence.mjs (design-system lint)
    workers/cron/      scheduled Worker: Cron Triggers → POST /internal/cron with a shared secret
    e2e/               Playwright smoke tests (need a reachable Supabase)
    design-system/     tokens, reference components, UI kits, email kit (read-only reference)
    docs/              PLAN.md (phases, decisions), superpowers/plans/ (phase checklists), decisions/ (ADRs)

## Commands
`pnpm dev` · `pnpm check` · `pnpm lint` · `pnpm test` · `pnpm build` · `pnpm db:types` · `pnpm db:push` · `pnpm cf` ·
`pnpm db:test` · `pnpm test:e2e` — details and the development loop in [AGENTS.md](AGENTS.md).

Heavy design media (photo originals, export zips) and the unrelated racquet-project
files are gitignored — see `.gitignore` for the exact list.

## Environments & deployment
Two Cloudflare Workers projects, branch-deployed from this repo:

| environment | CF project | branch | Supabase | Stripe |
|---|---|---|---|---|
| dev | `momentum-tennis-dev` | `deploy/dev` | dev project | test mode |
| live | `momentum-tennis` | `deploy/live` | prod project | live mode |

Flow: feature → `main` → merge to `deploy/dev` (verify on the dev deployment) →
merge to `deploy/live`. Database migrations apply to dev first, prod on release.

Each environment is described by a profile in `config/` — `dev.yaml` and `prod.yaml` —
holding what an operator needs (Supabase project, Cloudflare workers, deploy branch,
Stripe mode, and the names of the secrets it expects). Values the app reads at runtime
live in the env files; `pnpm env:check` verifies the two agree and refuses if a secret
ever appears in a committed file. `pnpm build:dev` / `pnpm build:live` build with the
profile's public values (a plain `vite build` would bake `.env.production` into dev).
Integration secrets are demanded only by the code that uses them, so an environment runs
before every phase's keys exist.

Step-by-step account setup — GitHub, Supabase, Cloudflare — is in
[docs/OPERATIONS.md](docs/OPERATIONS.md).

Environment variables: same names everywhere, different values per environment —
see `.env.example` for the canonical annotated list. Committed
`.env.development` / `.env.production` carry **public values only**; secrets go in
`.env.local` locally and Cloudflare project secrets when deployed.

## Getting started
1. Prereqs: Node 22+, pnpm, Supabase CLI (`brew install supabase/tap/supabase`), wrangler (in devDependencies).
2. `pnpm install && pnpm dev` — `.env.development` already points at the dev Supabase project.
3. Secrets only when a phase needs one: `cp .env.example .env.local` and fill that one in.
