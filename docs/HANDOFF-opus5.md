# Handoff — phases 8, 6, 7

Paste the block in §0 into a fresh session in this repository. Everything after it is the context
that prompt points at: the state on 2026-09-08, what phase 5 left behind, the plans for the three
remaining phases, the decisions on record, and the ritual every phase follows. Planning is finished
for every phase; what remains is implementation.

**Phase 5 is built and merged** (2026-09-08, all fourteen tasks): the checklist
`docs/superpowers/plans/2026-09-05-phase-5-payments.checklist.md` records what landed, what it waits
on, and what was learned building it. Phase 8 is next.

## 0. Prompt

```
You are taking over implementation of the Momentum Tennis academy platform in this repository.
Phases 0–5 are built and on main. Phase 8 (public site) is next; phases 6 and 7 follow in that
order, one phase per explicit approval.

Read in this order before doing anything: AGENTS.md (binding operating manual); docs/HANDOFF-opus5.md
(state, the ritual); docs/PLAN.md (phase table, decisions A–Q and the decision log — every answered
question lives there); docs/superpowers/plans/2026-09-08-phase-8-public-site.md (the spec you are
executing) and 2026-09-05-phase-5-payments.checklist.md (what the last phase learned about the
harness, the fakes and the design-system components); supabase/migrations/0001_schema.sql and
0007_schedule.sql (v_schedule_sessions and its RLS); src/lib/ds/* and design-system/components/**
(the port contract — read the .d.ts before the .jsx); src/routes/schedule and src/routes/store (the
public route patterns to copy); design-system/readme.md and design-system/PRODUCT.md §7, §11, §14;
docs/decisions/2026-09-05-lightbox-library.md (PhotoSwipe, adopted only when phase 8 passes its gate).

Rules, non-negotiable:
- One phase at a time, on branch phase-N/<name> from main. Every remaining phase has a plan under
  docs/superpowers/plans/ — execute it task by task (superpowers:executing-plans). Each plan opens
  with its questions and recommended defaults; the ones confirmed with the user are in the PLAN.md
  decision log, the rest stand as defaults until the user says otherwise — post a phase's still-open
  questions at its start and wait for the go. When a phase's exit criterion in docs/PLAN.md is met and
  every gate is green: merge to main, fast-forward deploy/dev, push, confirm the migration landed on
  the dev project, update AGENTS.md and the PLAN.md decision log, write the checklist, report, STOP.
- TDD without exception: a failing test observed before every implementation — vitest with the narrow
  fakes in src/lib/server/domain/schedule/fakes.ts for domain code, a numbered section in
  supabase/tests/validate.mjs (PGlite) for schema behaviour, svelte/server SSR contract tests for
  components. Migrations are append-only (0010 is next after 0009), one set per phase; run pnpm
  db:types and commit the generated types.
- The database is the authority: constraints, triggers and SECURITY DEFINER RPCs enforce the
  invariants; app code maps SQLSTATE and error tokens to ErrorCode in result.ts and never weakens a
  constraint to make a flow pass. Money is written by the 0009 RPCs or the service role, never by a
  family's client.
- Money, consent, minors: never guess policy; ask with a recommended default. Waiver, consent and
  marketing copy come from legal — never draft it, never claim compliance. Refund wording and Stripe
  Tax (decision E), the bank-pay discount and sponsor vectors are Artur's; no minor's photo or bio is
  published without a signed release.
- Design system: port design-system/components/**/*.jsx verbatim against their .d.ts contracts into
  src/lib/ds; tokens only; scripts/check-adherence.mjs is a gate; no UI libraries. The one sanctioned
  addition is photoswipe@5.4.4 in phase 8, behind the gate in docs/decisions/2026-09-05-lightbox-library.md.
- Secrets never enter git; every integration secret is demanded where it is used (requireSecret /
  secretOr503), never at startup. PAYMENTS_GATEWAY=fake is a dev convenience: pnpm env:check refuses
  it for prod — never set it on live. Never point anything at production; no real family data in dev.
- Gates before every report: pnpm env:check · pnpm check (0 errors, 0 warnings) · pnpm lint ·
  pnpm test · pnpm db:test · pnpm db:types leaves no diff · pnpm build:dev. Keep AGENTS.md true.

Follow AGENTS.md "Editing discipline": surgical edits, commit to an approach, no extra validation
scripts, literal prose. Begin: git checkout main; git pull; run the gates to confirm the state you
inherit; post phase 8's still-open questions and wait for the go; then branch phase-8/public-site
and start at its task 1.
```

## 1. State on 2026-09-08

- **Code.** `main` holds phases 0–5 (`phase-0/foundations` → `phase-5/payments` merged) plus the
  operations and planning commits. `deploy/dev` tracks `main` and deploys itself through `.github/workflows/deploy-dev.yml` (Cloudflare
  Workers Builds is deliberately disconnected). Remote `git@github.com:pronei/momentum-tennis.git`.
- **Database.** Migrations 0001–0009 on the dev project `rjiagjfvsaaxezsxfuzq` (0009 applied when
  `deploy/dev` was pushed on 2026-09-08; the Supabase GitHub integration applies migrations on push,
  with `migrate.yml` / `pnpm db:push dev` as the fallbacks). 0010 is next.
- **Gates on `main`.** `pnpm check` 0/0 · `pnpm lint` · 379 vitest · 139 harness checks ·
  types current · `pnpm build:dev`.
- **Operator state.** Done: dev Supabase project + schema through 0009; GitHub Actions deploy from
  `deploy/dev`; the first admin on dev (`pranayrs@hotmail.com`); the deployed worker's `EMAIL_FROM`.
  Not yet: **the dev worker holds no secrets** (`pnpm cf secret list --env dev` → `[]`) —
  `SUPABASE_SECRET_KEY` is required for phase-5 settlement and receipts (`pnpm cf secret put
  SUPABASE_SECRET_KEY --env dev`; the simulated checkout answers 503 without it, and booking
  confirmations on dev have been silently not sending for the same reason). **The user said on
  2026-09-08 that they will set it themselves — do not write secrets to the deployed worker.**
  Also not yet: a **published waiver version** on dev (the consent gate fails closed since 0008; the
  credentialed e2e publishes a placeholder if none exists); Stripe keys, Resend, the cron secret —
  each with its phase. Cloudflare
  Access is not possible on `*.workers.dev`; `docs/OPERATIONS.md` §3 has the custom-domain path.
- **Domain modules present.** `result.ts`, `time.ts`, `settings.ts`, `identity/*`, `waivers.ts`,
  `schedule/*` (with `fakes.ts`), `booking/*`, `cron.ts`, `notify/{send,adapters}.ts`,
  `payments/{webhook,store,gateway,gateway.runtime,products,orders,checkout,handlers,simulate,receipt}.ts`.
- **Design system ported.** core, forms, feedback, `admin/DataTable`, `schedule/ResourceDayView`,
  `schedule/SessionForm`, `site/ClassTimeline`, `site/CampTimeline`, `email/bookingConfirmation`,
  `email/paymentReceipt`.
  **Unported:** `admin/RatingMeter`, `site/CourtMeter` (phase 6); `site/SiteNav`, `site/ProgramCard`,
  `media/PhotoFrame`, `brand/StrobeArc`, `brand/Wordmark` (phase 8); the email templates
  `class-reminder`, `low-credits`, `re-consent-request`, `newsletter` (phase 7); the kits and the
  homepage template (phase 8).
- **Assets.** `design-system/assets/sponsors/` (four raster placeholders) and `assets/coaches/` (five
  portraits) were pulled from the current momentum-tennis.com on 2026-09-05 for phase 8.
- **Open and untouched.** Question O (restricted minor login) — do not build it. Camp and team-fee
  purchase — deferred (phase-5 plan, question 6).

## 2. Phase 5 — what it left behind

**Spec:** `docs/superpowers/plans/2026-09-05-phase-5-payments.md`. **Checklist:**
`2026-09-05-phase-5-payments.checklist.md` — the task table cited by commit subject, what the phase
waits on, and the mechanics worth not relearning (the `fakeDb` reply-per-table shape, the RPC arg
types being optional rather than nullable, `DataTable`'s single `cell` snippet, `resolve()` needing
the route group inside `(portal)`). Read it before touching payments or any admin list.

Two e2e specs assert the seeded catalogue and the whole purchase walk (`smoke.test.ts`'s store test
and `family-purchase.test.ts`). They need 0009 on dev — which it now is — plus, for the credentialed
one, `E2E_ADMIN_EMAIL` / `E2E_ADMIN_PASSWORD` and a published waiver.

## 3. The remaining phases, in order

1. **Phase 8 — public site** (`2026-09-08-phase-8-public-site.md`): the five site ports, the `(site)`
   route group, content modules with `consented` defaulting to *not published*, the camps banner on
   phase-3 rows, PhotoSwipe behind the spike's gate. Operator: roster confirmation, media releases,
   sponsor brand kits, Artur's copy review.
2. **Phase 6 — ratings** (`2026-09-08-phase-6-ratings.md`): no migration; harness §16 pins the 0001
   policies; `ratings.ts`; RatingMeter and CourtMeter ports; coach entry, admin dimensions, the
   portal meter with its 30-day pin. Operator: nothing.
3. **Phase 7 — notifications** (`2026-09-08-phase-7-notifications.md`): 0011 read models, the
   unsubscribe token and RPC, `newsletter_issues`; the job registry; four email ports; preferences,
   unsubscribe, admin newsletter; the cron worker deployed. Operator: Resend domain and key,
   `CRON_SHARED_SECRET` on both sides, `MAILING_ADDRESS`, legal copy for consent and unsubscribe.

## 4. Decisions on record

`docs/PLAN.md` decision log — the 2026-09-05 entries record what the user confirmed for phase 5
(catalogue, validity 84 + L's 7, the simulated gateway, refunds of untouched packs only, camps
deferred, dashboard-managed payment methods) and the creation of phase 8.
`docs/decisions/2026-09-03-postgres-on-supabase-not-d1.md`, `2026-09-03-calendar-library.md` (no
calendar dependency), `2026-09-05-lightbox-library.md` (PhotoSwipe, proposed; adopted only when
phase 8 passes its gate).

## 5. The ritual, every phase

1. Branch `phase-N/<name>` from `main`. Post the still-open questions (defaults first); wait for the go.
2. RED before GREEN for every unit: domain (vitest, fakes), schema (harness section), component (SSR).
3. Migration `000N` append-only; `pnpm db:test`; `pnpm db:types`; commit types.
4. Ports verbatim; adherence gate; `/styleguide` shows every new component.
5. Gates: `pnpm env:check` · `pnpm check` · `pnpm lint` · `pnpm test` · `pnpm db:test` · types no diff · `pnpm build:dev`.
6. Merge to `main`, `git branch -f deploy/dev main`, push both; confirm the migration on the dev
   project (dashboard → Database → Migrations, or the curl in `docs/OPERATIONS.md` §2); run
   `pnpm test:e2e` against dev when the operator prerequisites are met.
7. Update `AGENTS.md` (status, repo map, commands) and `docs/PLAN.md` (phase row, decision log);
   write the phase's checklist under `docs/superpowers/plans/`; report; stop.
