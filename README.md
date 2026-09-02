# Momentum Tennis — academy platform

Web platform for [Momentum Tennis](https://momentum-tennis.com) (Cupertino, CA):
programs and scheduling across De Anza College and Murdock Park, guardian/player
accounts, versioned waivers, credit-based class and lesson booking, payments,
coach tools, and notifications.

**Status: pre-scaffold.** Schema and phase plan are in [docs/PLAN.md](docs/PLAN.md),
gated on per-phase approval. Contributor and agent rules: [AGENTS.md](AGENTS.md).

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
    design-system/     tokens, reference components, UI kits, email kit (read-only reference)
    docs/              PLAN.md (phases + open questions), decisions/ (ADRs)
    src/               SvelteKit app                    (planned — phase 0)
    supabase/          migrations, seed                 (planned — phase 0)
    workers/cron/      scheduled worker                 (planned — phase 7)

Heavy design media (photo originals, export zips) and the unrelated racquet-project
files are gitignored — see `.gitignore` for the exact list.

## Environments & deployment
Two Cloudflare Workers projects, branch-deployed from this repo:

| environment | CF project | branch | Supabase | Stripe |
|---|---|---|---|---|
| dev | `momentumtennis-dev` | `deploy/dev` | dev project | test mode |
| live | `momentumtennis` | `deploy/live` | prod project | live mode |

Flow: feature → `main` → merge to `deploy/dev` (verify on the dev deployment) →
merge to `deploy/live`. Database migrations apply to dev first, prod on release.

Environment variables: same names everywhere, different values per environment —
see `.env.example` for the canonical annotated list. Committed
`.env.development` / `.env.production` carry **public values only**; secrets go in
`.env.local` locally and Cloudflare project secrets when deployed.

## Getting started (once phase 0 lands)
1. Prereqs: Node 22+, pnpm, Supabase CLI, wrangler.
2. `cp .env.example .env.local` and fill the secrets (test-mode keys).
3. Fill the `TODO` values in `.env.development` (dev Supabase project).
4. `pnpm install && pnpm dev`
