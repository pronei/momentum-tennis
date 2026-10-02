# Handoff — phases 6, 7

Paste the block in §0 into a fresh session in this repository. Everything after it is the context
that prompt points at: the state on 2026-09-30, what phases 5 and 8 left behind, the plans for the two
remaining phases, the decisions on record, and the ritual every phase follows. Planning is finished
for every phase; what remains is implementation.

**Phases 5 and 8 are built and merged** (2026-09-08 and 2026-09-30): their checklists
`docs/superpowers/plans/2026-09-05-phase-5-payments.checklist.md` and
`2026-09-08-phase-8-public-site.checklist.md` record what landed, what each waits on, and what was
learned building it. Phase 6 is next.

## 0. Prompt

```
You are taking over implementation of the Momentum Tennis academy platform in this repository.
Phases 0–5 and 8 are built and on main. Phase 6 (ratings) is next; phase 7 follows, one phase per
explicit approval.

Read in this order before doing anything: AGENTS.md (binding operating manual); docs/HANDOFF-opus5.md
(state, the ritual); docs/PLAN.md (phase table, decisions A–Q and the decision log — every answered
question lives there); docs/superpowers/plans/2026-09-08-phase-6-ratings.md (the spec you are
executing) and the checklists 2026-09-08-phase-8-public-site.checklist.md and
2026-09-05-phase-5-payments.checklist.md (what the last phases learned about the harness, the fakes
and the design-system ports); supabase/migrations/0001_schema.sql (rating_dimensions, rating_events,
v_current_ratings and their RLS); src/lib/ds/* and design-system/components/admin/RatingMeter and
site/CourtMeter (the port contract — read the .d.ts before the .jsx); src/routes/coach and
src/routes/admin (the console patterns to copy); design-system/readme.md and design-system/PRODUCT.md
§3, §11, §14.

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
  src/lib/ds; tokens only; scripts/check-adherence.mjs is a gate; no UI libraries. The one UI
  dependency is photoswipe@5.4.4, pinned exactly (docs/decisions/2026-09-05-lightbox-library.md);
  nothing else is sanctioned.
- Secrets never enter git; every integration secret is demanded where it is used (requireSecret /
  secretOr503), never at startup. PAYMENTS_GATEWAY=fake is a dev convenience: pnpm env:check refuses
  it for prod — never set it on live. Never point anything at production; no real family data in dev.
- Gates before every report: pnpm env:check · pnpm check (0 errors, 0 warnings) · pnpm lint ·
  pnpm test · pnpm db:test · pnpm db:types leaves no diff · pnpm build:dev. Keep AGENTS.md true.

Follow AGENTS.md "Editing discipline": surgical edits, commit to an approach, no extra validation
scripts, literal prose. Begin: git checkout main; git pull; run the gates to confirm the state you
inherit; post phase 6's still-open questions and wait for the go; then branch phase-6/ratings and
start at its task 1.
```

## 1. State on 2026-09-30

- **Code.** `main` holds phases 0–5 and 8 (`phase-0/foundations` → `phase-5/payments`, then
  `phase-8/public-site`, merged) plus the
  operations and planning commits. `deploy/dev` tracks `main` and deploys itself through `.github/workflows/deploy-dev.yml` (Cloudflare
  Workers Builds is deliberately disconnected). Remote `git@github.com:pronei/momentum-tennis.git`.
- **Database.** Migrations 0001–0009 on the dev project `rjiagjfvsaaxezsxfuzq` (0009 applied when
  `deploy/dev` was pushed on 2026-09-08; the Supabase GitHub integration applies migrations on push,
  with `migrate.yml` / `pnpm db:push dev` as the fallbacks). 0010 is next.
- **Gates on `main`.** `pnpm check` 0/0 · `pnpm lint` · 427 vitest · 139 harness checks ·
  types current · `pnpm build:dev` · 20 e2e passed, 3 skipped (the credentialed specs).
- **Operator state.** Done: dev Supabase project + schema through 0009; GitHub Actions deploy from
  `deploy/dev`; the first admin on dev (`pranayrs@hotmail.com`); the deployed worker's `EMAIL_FROM`.
  Done since: `SUPABASE_SECRET_KEY` on the dev worker (the user set it; checked 2026-09-30) — secrets
  on deployed workers are the user's to set, never the agent's. Not yet: a **published waiver
  version** on dev (checked 2026-09-30: the Participation waiver exists with no published version;
  the consent gate fails closed since 0008, and the credentialed e2e publishes a placeholder if none
  exists); Stripe keys, Resend, the cron secret —
  each with its phase. Cloudflare
  Access is not possible on `*.workers.dev`; `docs/OPERATIONS.md` §3 has the custom-domain path.
- **Domain modules present.** `result.ts`, `time.ts`, `settings.ts`, `identity/*`, `waivers.ts`,
  `schedule/*` (with `fakes.ts`), `booking/*`, `cron.ts`, `notify/{send,adapters}.ts`,
  `payments/{webhook,store,gateway,gateway.runtime,products,orders,checkout,handlers,simulate,receipt}.ts`.
- **Design system ported.** core, forms, feedback, brand (`Wordmark`, `StrobeArc`), media
  (`PhotoFrame`, the `Lightbox` addition), `admin/DataTable`, `schedule/ResourceDayView`,
  `schedule/SessionForm`, site (`ClassTimeline`, `CampTimeline`, `SiteNav`, `ProgramCard`, the
  `SponsorStrip` addition), `email/bookingConfirmation`, `email/paymentReceipt`; the homepage
  template is the `(site)` home page.
  **Unported:** `admin/RatingMeter`, `site/CourtMeter` (phase 6); the email templates
  `class-reminder`, `low-credits`, `re-consent-request`, `newsletter` (phase 7).
- **Assets.** Published images live in `static/` (`photos/`, `coaches/`, `sponsors/`, the logos),
  WebP without metadata; their sources stay in `design-system/assets/`. `src/lib/content` names
  them, and its tests check each exists.
- **Open and untouched.** Question O (restricted minor login) — do not build it. Camp and team-fee
  purchase — deferred (phase-5 plan, question 6).

## 2. Phases 5 and 8 — what they left behind

**Spec:** `docs/superpowers/plans/2026-09-05-phase-5-payments.md`. **Checklist:**
`2026-09-05-phase-5-payments.checklist.md` — the task table cited by commit subject, what the phase
waits on, and the mechanics worth not relearning (the `fakeDb` reply-per-table shape, the RPC arg
types being optional rather than nullable, `DataTable`'s single `cell` snippet, `resolve()` needing
the route group inside `(portal)`). Read it before touching payments or any admin list.

Two e2e specs assert the seeded catalogue and the whole purchase walk (`smoke.test.ts`'s store test
and `family-purchase.test.ts`). They need 0009 on dev — which it now is — plus, for the credentialed
one, `E2E_ADMIN_EMAIL` / `E2E_ADMIN_PASSWORD` and a published waiver.

**Phase 8** (`2026-09-08-phase-8-public-site.md`, checklist beside it): the public site is the
`(site)` group, and every person on it passes a `consented` filter in `src/lib/content`. Its checklist
lists what waits on Artur — copy review, credentials, Matthew's title, Tom's pronouns, UTR's vector,
the GPS still in the live site's photos — and the mechanics found building it: the `SiteNav`
containing-block trap, PhotoSwipe binding keys only after its opening animation, CSS side effects in
the barrel, `resolve('/(site)')` and `asset()` for links.

## 3. The remaining phases, in order

1. **Phase 9 — Sign in with Google** (`2026-10-01-phase-9-google-sign-in.md`), first because it
   needs no email: 0010 gives a new account the name its sign-up already knows (harness §16);
   `/auth/google` starts Supabase's Google flow from a form, so it works without JavaScript; the login
   page explains a failed link or an unfinished Google sign-in; Google's button artwork is the
   recorded design-system exception. Operator: a Google Cloud OAuth client, the Google provider
   enabled in Supabase with its id and secret, `<site>/auth/callback**` in the redirect URLs — before
   the merge, or the button meets Supabase's "provider is not enabled".
2. **Phase 6 — ratings** (`2026-09-08-phase-6-ratings.md`): no migration; harness §17 pins the 0001
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
