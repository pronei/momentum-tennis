# AGENTS.md — operating manual for agents (and humans)

Momentum Tennis academy platform: SvelteKit on Cloudflare Workers, Supabase Postgres
with RLS, Stripe, Resend. **Most players are minors** — that fact shapes every model
and every policy here.

## Status
Pre-scaffold. Schema v2 and the phase plan are proposed in `docs/PLAN.md`, gated on
approval. The design system in `design-system/` is complete and binding.

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

## Commands (PLANNED — real once phase 0 scaffolds)
`pnpm dev` · `pnpm build` · `pnpm check` · `pnpm lint` · `pnpm test` ·
`pnpm db:types` · `supabase db push` · `wrangler deploy` (workers/cron)

## Repo map
- `design-system/` — Claude Design export: tokens (CSS custom properties),
  JSX reference components, UI kits, email kit, PRODUCT.md. Heavy media is
  gitignored; code and docs are committed. Treat as read-only reference.
- `docs/PLAN.md` — phases, exit criteria, open questions. `docs/decisions/` — ADRs.
- PLANNED (phase 0): `src/` (SvelteKit app), `supabase/` (migrations, seed),
  `workers/cron/` (scheduled worker), `e2e/`.
