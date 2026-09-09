# Handoff — Opus 5 continues phase 5 from task 8, then phases 8, 6, 7

Paste the block in §0 into a fresh Opus 5 session in this repository. Everything after it is the
context that prompt points at: the state on 2026-09-08, where phase 5 stands, the plans for the three
remaining phases, the decisions on record, and the ritual every phase follows. Planning is finished
for every phase; what remains is implementation.

## 0. Prompt

```
You are taking over implementation of the Momentum Tennis academy platform in this repository.
Phases 0–4 are built and on main. Phase 5 (payments) is in progress on branch phase-5/payments
with tasks 1–7 of 14 done and every gate green; phases 8, 6 and 7 are planned and run in that order,
one phase per explicit approval.

Read in this order before doing anything: AGENTS.md (binding operating manual); docs/HANDOFF-opus5.md
(state, where phase 5 stands, the ritual); docs/PLAN.md (phase table, decisions A–Q and the decision
log — every answered question lives there); docs/superpowers/plans/2026-09-05-phase-5-payments.md
(the spec you are executing) and 2026-09-05-phase-5-payments.checklist.md (where to pick up and what
was learned building tasks 1–7); supabase/migrations/0001_schema.sql (products, orders, order_items,
credit_ledger, issue_credits and their RLS) and 0009_payments.sql; supabase/tests/validate.mjs §15;
src/lib/server/domain/payments/* — read each module's test before the module; src/lib/server/domain/
booking/credits.ts and src/routes/admin/credits (the domain and route patterns to copy);
src/routes/(portal)/portal/book/notify.ts (how a mail is sent); design-system/readme.md and
design-system/PRODUCT.md §7, §11, §14.

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
scripts, literal prose. Begin: git checkout phase-5/payments; read the checklist; run the gates to
confirm the state you inherit; then task 8 of the phase-5 plan. Do not merge phase 5 until all
fourteen tasks are done and its exit criterion holds on dev.
```

## 1. State on 2026-09-08

- **Code.** `main` holds phases 0–4 (`phase-0/foundations` → `phase-4/booking` merged) plus the
  operations and planning commits. `phase-5/payments` (pushed, rebased onto `main`) holds tasks 1–7.
  `deploy/dev` tracks `main` and deploys itself through `.github/workflows/deploy-dev.yml` (Cloudflare
  Workers Builds is deliberately disconnected). Remote `git@github.com:pronei/momentum-tennis.git`.
- **Database.** Migrations 0001–0008 are applied to the dev project `rjiagjfvsaaxezsxfuzq`.
  **0009 exists only on the branch**, harness-validated (139 checks); it reaches dev when the branch
  merges and `deploy/dev` is pushed (the Supabase GitHub integration applies migrations on push;
  `migrate.yml` / `pnpm db:push dev` are the fallbacks).
- **Gates at the branch tip.** `pnpm check` 0/0 · `pnpm lint` · 352 vitest · 139 harness checks ·
  types current · `pnpm build:dev` · CI green on `main`.
- **Operator state.** Done: dev Supabase project + schema through 0008; GitHub Actions deploy from
  `deploy/dev`; the first admin on dev (`pranayrs@hotmail.com`); the deployed worker's `EMAIL_FROM`.
  Not yet: **the dev worker holds no secrets** (`pnpm cf secret list --env dev` → `[]`) —
  `SUPABASE_SECRET_KEY` is required for phase-5 settlement and receipts (`pnpm cf secret put
  SUPABASE_SECRET_KEY --env dev`; the simulated checkout answers 503 without it, and booking
  confirmations on dev have been silently not sending for the same reason); a **published waiver
  version** on dev (the consent gate fails closed since 0008; the credentialed e2e publishes a
  placeholder if none exists); Stripe keys, Resend, the cron secret — each with its phase. Cloudflare
  Access is not possible on `*.workers.dev`; `docs/OPERATIONS.md` §3 has the custom-domain path.
- **Domain modules present.** `result.ts`, `time.ts`, `settings.ts`, `identity/*`, `waivers.ts`,
  `schedule/*` (with `fakes.ts`), `booking/*`, `cron.ts`, `notify/{send,adapters}.ts`,
  `payments/{webhook,store,gateway,gateway.runtime,products,orders,checkout}.ts`.
- **Design system ported.** core, forms, feedback, `admin/DataTable`, `schedule/ResourceDayView`,
  `schedule/SessionForm`, `site/ClassTimeline`, `site/CampTimeline`, `email/bookingConfirmation`.
  **Unported:** `admin/RatingMeter`, `site/CourtMeter` (phase 6); `site/SiteNav`, `site/ProgramCard`,
  `media/PhotoFrame`, `brand/StrobeArc`, `brand/Wordmark` (phase 8); the email templates
  `payment-receipt` (phase 5), `class-reminder`, `low-credits`, `re-consent-request`, `newsletter`
  (phase 7); the kits and the homepage template (phase 8).
- **Assets.** `design-system/assets/sponsors/` (four raster placeholders) and `assets/coaches/` (five
  portraits) were pulled from the current momentum-tennis.com on 2026-09-05 for phase 8.
- **Open and untouched.** Question O (restricted minor login) — do not build it. Camp and team-fee
  purchase — deferred (phase-5 plan, question 6).

## 2. Phase 5 — where it stands

**Spec:** `docs/superpowers/plans/2026-09-05-phase-5-payments.md`. **Checklist:**
`2026-09-05-phase-5-payments.checklist.md` — the task table, cited by commit subject.

**Done (tasks 1–7).** `PAYMENTS_GATEWAY` with the prod guard; 0009 (catalogue seed with fixed ids
`…0501` weekday / `…0502` weekend, `create_order`, `settle_order`, `cancel_order`, `refund_order`)
and harness §15; the seven error codes; the `'skipped'` webhook outcome; the gateway port with the
Stripe and simulated adapters and `selectGateway()`; `products.ts`; `orders.ts` + `checkout.ts`.

**Next (tasks 8–14).** 8 `simulate.ts` + `handlers.ts` + the webhook route · 9 the receipt (email
port + `receipt.ts`) · 10 public `/store` · 11 portal simulated checkout, purchases, receipt page, nav ·
12 `/admin/products` · 13 `/admin/orders` with Refund/Cancel · 14 e2e, OPERATIONS, records, finish.

**Things learned building 1–7, so you do not relearn them.**
- `getAcademySettings()` does not yet expose `default_credit_validity_days` / `default_forgiven_skips`;
  `packFacts(product, defaults)` takes them as an argument. Add both to `settings.ts` (with a
  `settings.test.ts` case) when building `/store` in task 10.
- `fakeDb` answers one reply per table and one for every `rpc`; a function that reads a table twice
  gets the same reply twice. `orderLots` was shaped around that (three reads, three tables).
- Object-literal fixtures widen enum fields to `string`; annotate them with the input type
  (`const pack: ProductInput = …`) or `svelte-check` fails while vitest passes.
- `svelte-check`'s summary line contains the word `ERRORS`; grep for `"ERROR "` with the quote if you
  count errors in a script. In zsh, `status` is a read-only variable — do not name a shell variable that.
- Harness mechanics: `asUser(null)` is the service-role path (no user); RLS assertions need
  `await db.exec('set role authenticated')` … `reset role`; `monday` is the Monday two weeks out, so
  every generated occurrence is in the future; `expectErr` matches on a substring of the message
  (`'row-level security'`, `'check constraint'`, `'append-only'`, `'duplicate key'`).
- `gateway.runtime.ts` wraps the Stripe SDK in two named calls typed against the real SDK on purpose;
  do not replace them with a cast — the port's parameter types are checked there.
- The simulated checkout and the admin refund must run synthetic events through
  `handleStripeEvent` with the **service-role** client (`createAdminSupabase()`), never the user's:
  `settle_order` and `refund_order` refuse a non-admin user, and that refusal is the guarantee.
- The interim Payment Links share the Stripe account: any event whose object carries no `order_id`
  must be answered `'skipped'`, never thrown.

## 3. The remaining phases, in order

1. **Phase 5** to its exit: test-mode purchase → credits → booking → refund, fully audited, on the
   simulated gateway; Stripe keys, ACH and the discount follow once Artur has them.
2. **Phase 8 — public site** (`2026-09-08-phase-8-public-site.md`): the five site ports, the `(site)`
   route group, content modules with `consented` defaulting to *not published*, the camps banner on
   phase-3 rows, PhotoSwipe behind the spike's gate. Operator: roster confirmation, media releases,
   sponsor brand kits, Artur's copy review.
3. **Phase 6 — ratings** (`2026-09-08-phase-6-ratings.md`): no migration; harness §16 pins the 0001
   policies; `ratings.ts`; RatingMeter and CourtMeter ports; coach entry, admin dimensions, the
   portal meter with its 30-day pin. Operator: nothing.
4. **Phase 7 — notifications** (`2026-09-08-phase-7-notifications.md`): 0011 read models, the
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
