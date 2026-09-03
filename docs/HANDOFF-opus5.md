# Handoff — Opus 5 implements phases 3 → 7

Paste the block in §0 into a fresh Opus 5 session in this repository. Everything after it is the
context that prompt points at: the state on 2026-09-03, the scope of each remaining phase, and
the ritual every phase follows. Planning and schema are finished; what remains is implementation.

## 0. Prompt

```
You are taking over implementation of the Momentum Tennis academy platform in this repository.
Planning, the full schema, and phases 0–2 are done. You implement phases 3 → 7 sequentially, one
phase per explicit approval.

Read in this order before doing anything: AGENTS.md (binding operating manual), docs/HANDOFF-opus5.md
(state, phase scopes, ritual), docs/PLAN.md (phase table, resolved decisions A–Q, open questions),
docs/superpowers/plans/2026-09-02-phase-2-waivers.md (what a finished phase checklist looks like),
supabase/migrations/0001_schema.sql (the whole model already exists — read the sections for the
phase at hand, including its RLS policies), supabase/tests/validate.mjs (the behavioural harness you
extend), src/lib/server/domain/result.ts and waivers.ts (the domain pattern to copy),
src/routes/admin/waivers and src/routes/(portal)/portal/account (the route and superforms patterns),
design-system/readme.md and design-system/PRODUCT.md (the port contract).

Rules, non-negotiable:
- One phase at a time. Open phase N by posting its batched questions (recommended default first)
  and its plan at docs/superpowers/plans/<date>-phase-N-<name>.md (bite-sized tasks, exact files,
  the test code, the commands). Implement on branch phase-N/<name> from main. When the exit
  criteria in docs/PLAN.md are met and every gate is green: merge to main, fast-forward deploy/dev,
  push, confirm the migration landed on the dev project, update AGENTS.md status and the docs/PLAN.md
  decision log, report, and STOP. Never start the next phase without approval.
- TDD without exception: a failing test observed before every implementation — vitest with narrow
  fakes for domain code, a numbered section in supabase/tests/validate.mjs (PGlite) for schema
  behaviour, svelte/server SSR contract tests for components. Migrations are append-only from 0007,
  one set per phase, harness-validated before they leave your machine; run pnpm db:types and commit
  the generated types.
- The database is the authority: constraints, triggers and SECURITY DEFINER RPCs enforce the
  invariants; app code maps SQLSTATE and error tokens to ErrorCode in result.ts and never weakens a
  constraint to make a flow pass.
- Money, consent, minors: never guess policy; ask with a recommended default. Waiver, consent and
  marketing copy come from legal — never draft it, never claim compliance.
- Design system: port design-system/components/**/*.jsx verbatim against their .d.ts contracts into
  src/lib/ds (composites in src/lib/components); tokens only; scripts/check-adherence.mjs is a gate;
  no UI libraries. @event-calendar/core (MIT) is the one sanctioned calendar dependency, admin-only,
  and only after the theming spike in phase 3 says it can meet the design rules.
- Secrets never enter git; every integration secret is demanded where it is used (requireSecret /
  secretOr503), never at startup. Never point anything at production; no real family data in dev.
- Gates before every report: pnpm env:check · pnpm check (0 errors, 0 warnings) · pnpm lint ·
  pnpm test · pnpm db:test · pnpm db:types leaves no diff · pnpm build:dev. Keep AGENTS.md true —
  update it in the same change when a convention moves.

Begin with phase 3 (schedule & availability) as scoped in docs/HANDOFF-opus5.md §2: post its
questions and its plan first, then wait for the go.
```

## 1. State on 2026-09-03

- **Code.** `main` holds everything (phase-0/foundations → phase-1/identity → phase-2/waivers merged,
  plus the operations commits); `deploy/dev` tracks `main`; the phase branches remain for history.
  Remote `git@github.com:pronei/momentum-tennis.git` — public, AGPL-3.0.
- **Database.** Migrations 0001–0006 are applied to the dev project `rjiagjfvsaaxezsxfuzq`
  (0005 reference data: six skill levels, De Anza College + Murdock Park, the `court_placement`
  rating dimension, the `liability` waiver document; 0006 the RLS safety-net event trigger). The dev
  project runs Supabase's OrioleDB storage engine; the constraints the guarantees rest on were
  verified enforced there. Production must be created as standard Postgres.
- **Gates.** check 0/0 · lint · 119 vitest · 100 harness checks · types current · build:dev · CI green.
- **Tooling.** `pnpm db:push <profile>` (direct connection, password in `.env.local`); the Supabase
  GitHub integration applies migrations on push to `deploy/dev` (`migrate.yml` is the manual
  fallback); `pnpm cf …` (repo-scoped wrangler); `pnpm build:dev`; `pnpm env:check`.
- **Operator state.** Done: Supabase dev project + schema, GitHub CI, repository secret for the
  fallback workflow. Not yet: Cloudflare credentials for the recorded account, first deploy and
  `deploy.site_url`, Supabase Auth redirect URLs, the first admin account on dev, Access protection.
  `docs/OPERATIONS.md` §7 lists what each phase needs. Code gates never depend on these; the
  "deliverable on the dev deployment" half of a phase's gate does.
- **Domain modules present.** `result.ts`, `time.ts`, `settings.ts`, `identity/{account,age,players,staff}.ts`,
  `waivers.ts`, `booking/index.ts` (only `bookClass`/`cancelBooking` wrappers), `cron.ts`
  (`authorizeCron`, `jobsFor`, `runJobs`), `payments/{webhook,store}.ts` (idempotency port; handlers
  empty), `notify/{send,adapters}.ts` (`sendTransactional`/`sendMarketing`, insert-first dedupe).
- **Design system ported.** core: Button, Eyebrow, FrameTicks, TextField · forms: Checkbox, DateField,
  FieldShell, FormSection, SegmentedControl, Select, TextArea, TimeField · feedback: Banner, Dialog,
  EmptyState, Pagination, StatusChip, Tabs, Toast · composites: PlayerSwitcher, Card.
  **Unported:** admin/DataTable, admin/RatingMeter, schedule/ResourceDayView, schedule/SessionForm,
  site/CourtMeter, site/ClassTimeline, site/CampTimeline, site/ProgramCard, site/SiteNav,
  brand/StrobeArc, brand/Wordmark, media/PhotoFrame; the kits `ui_kits/{admin,portal,website,combined}`;
  `templates/email` (six) and `templates/homepage`.
- **Open and untouched.** Question O (restricted minor login) is unanswered — do not build it.

## 2. Phase 3 — schedule & availability (next)

**Exit criterion (PLAN):** Artur can enter the real fall schedule; the calendar renders it in academy time.

**Already in the schema (0001).** `locations`, `courts`, `court_availability` + `court_availability_exceptions`,
`court_available()`, the triggers `sessions_within_availability` and `availability_protects_sessions`
(decision H), `sessions` with the court and coach EXCLUDE constraints and `session_skill_levels` (N),
`terms`, `classes` + `class_skill_levels`, `class_sessions`, `generate_class_sessions()` (DST-correct,
copies level tags), `cancel_session()` (make-whole), `camps` + `camp_sessions` + the season trigger,
`teams` + `team_members` + `team_sessions`, audit triggers on sessions and availability. Decide per
table whether admin writes are direct (RLS admin policy) or need an RPC only after reading the policies.

**Migration 0007 — only what the model lacks.** Candidates, each justified in the plan or dropped:
`set_session_levels(p_session, p_level_keys text[])` if bulk tagging is cleaner than row writes;
nothing for moving a session (an UPDATE is already constraint-checked). Harness sections 12+: a class
expanded across the November DST change keeps its wall-clock time; a session outside availability is
refused; shrinking availability under a scheduled session is refused; level tags are copied on
generation; a camp outside the season is refused; an EXCLUDE conflict maps to `slot_taken`.

**Domain.** `src/lib/server/domain/schedule/` split by concern (locations+courts, availability,
terms+classes, sessions, camps, teams), zod schemas colocated, every function takes the Supabase
client and returns `Result`. New codes: `availability_in_use`, `camp_out_of_season`, `camp_full`
(`court_unavailable`, `slot_taken`, `conflict` exist).

**Admin UI.** `/admin/schedule` — ResourceDayView port: one location, columns per court, sessions as
blocks, date navigation, academy time. `/admin/schedule/new` and `/admin/schedule/[id]` — SessionForm
port: type, court, coach, times, level tags, notes; cancel through `cancel_session` behind a Dialog.
`/admin/availability` — per location: courts, recurring windows with `reservation_ref`, exceptions
(closed/open). `/admin/classes` — terms; class templates (ISO weekday, wall-clock start, 90/120 min,
capacity, default court and coach, level tags); "generate occurrences" for a term range.
`/admin/camps`, `/admin/teams` — CRUD and rosters. DataTable port backs every list.

**Portal and site.** `/portal/schedule` — read-only week/day list of scheduled sessions, filtered by
the `?player=` context's level (bespoke, tokens only, no library). Public `/schedule` with the
ClassTimeline and CampTimeline ports is in scope only if the opening questions approve it.

**Calendar decision.** Theming spike on `@event-calendar/core`'s resource day view first. If its CSS
variables cannot meet the rules (no shadows, one radius, mono data strings, amber present frame),
ship the ResourceDayView port alone. Recommended default: the port alone for v1.

**Opening questions to batch (recommended default first).** Coach choices for `coach_id` = staff
members with role `coach` (yes). Court-less sessions only for team away matches (yes). Generation
horizon = the term (yes). Public schedule page in scope (yes, read-only). Camp registration UI deferred
to phase 5 because it needs a purchase (yes). Coach availability stays unmodelled per H (yes).

**Operator prerequisites.** The first admin account on dev; a dev deployment for the demo.
**e2e.** An admin creates a court, a window and a class on dev, generates a week, and sees it in the
day view.

## 3. Phase 4 — booking, credits & attendance

**Already.** `book_class`, `cancel_booking` (24-hour rule, reversal, forgiveness L), `promote_waitlist`
(K), `finalize_bookings` (no-show settlement), `issue_credits` (the only issuance path; admin grants
use it), `pick_lot`, `credit_ledger` + `v_lot_remaining` + `v_credit_balances`, the weekly-cap and
active-booking uniques, `lesson_bookings`, `session_attendance`, `assert_waivers_signed()`, `booking/index.ts`.

**Build.** Portal booking: sessions filtered by level, scope and `booking_horizon_days`; waiver gate
refusals from `describeError`; confirmation. Cancellation with the rule shown before confirming and the
reversal visible in the ledger. Waitlist join and promotion. Private-lesson booking on `lesson_bookable`
windows (an RPC in 0008 if 0001 lacks one). Admin credit grants (reason required, audited). Attendance
for coach and admin (`/coach/sessions/[id]`). Booking-confirmation email through `sendTransactional`
using `templates/email/booking-confirmation.html` (dev adapter prints). Ledger drill-in gated by
`can_view_financials`. Harness: the cap, the gate, both forgiveness paths, cancel-then-re-book; PGlite
is single-connection, so document that the race proof is the constraint itself.

**Exit.** A real week bookable on dev with admin-granted credits. **Operator.** Nothing new.

## 4. Phase 5 — payments

**Already.** `products` (Stripe price ids, member price), `orders`/`order_items`, `stripe_events`,
`payments/webhook.ts` idempotency port + `supabaseEventStore`, the webhook route (handlers empty),
lazy secrets.

**Build.** Checkout Session creation (ACH first, cards, Apple Pay, Google Pay, Cash App Pay, Link;
bank-pay discount, never a surcharge); handlers: `checkout.session.completed` → order,
`payment_intent.succeeded` → `issue_credits` idempotent per order item (D), failures and refunds →
reversal rows; receipts (`payment-receipt` template); purchases dashboard; admin refund path; Stripe
Tax off (E); member pricing.

**Exit.** Test-mode purchase → credits → booking → refund, fully audited; Payment Links retired.
**Operator.** Stripe test keys and the webhook signing secret as Cloudflare secrets; payment methods
enabled (ACH Direct Debit activation, Apple Pay domain registration, Cash App Pay); production
Supabase on Pro as standard Postgres before anything goes live; refund wording and tax stance from
Artur and the accountant.

## 5. Phase 6 — ratings & coach tools

**Already.** `rating_dimensions` (`court_placement` seeded), `rating_events` (append-only, scale
snapshot trigger), `v_current_ratings`. **Build.** Dimension admin, coach entry per player, RatingMeter
and CourtMeter ports (five bars with text values, never colour alone), portal surface and history.
**Operator.** Nothing.

## 6. Phase 7 — notifications & lifecycle

**Already.** `workers/cron`, `/internal/cron`, `cron.ts` dispatch, `notification_sends` (`trigger_key`
dedupe), `marketing_consents`, `notify/send.ts`, the six email templates. **Build.** Class reminders,
low-credit nudges, `expire_credits` rows, re-consent campaigns, newsletter with unsubscribe and a
preference centre; the Resend adapter wired; the cron worker deployed with `CRON_SHARED_SECRET`.
**Exit.** Overlapping cron runs cannot double-send; marketing and transactional fully separated.
**Operator.** Resend domain and key, the shared secret on both sides, the cron worker deploy,
marketing and unsubscribe copy from legal.

## 7. The ritual, every phase

1. Branch `phase-N/<name>` from `main`. Post questions (defaults first) and the plan; wait for the go.
2. RED before GREEN for every unit: domain (vitest, fakes), schema (harness section), component (SSR).
3. Migration `000N` append-only; `pnpm db:test`; `pnpm db:types`; commit types.
4. Ports verbatim; adherence gate; `/styleguide` shows every new component.
5. Gates: `pnpm env:check` · `pnpm check` · `pnpm lint` · `pnpm test` · `pnpm db:test` · types no diff · `pnpm build:dev`.
6. Merge to `main`, `git branch -f deploy/dev main`, push both; confirm the migration on the dev
   project (dashboard → Database → Migrations, or the curl in `docs/OPERATIONS.md` §2); run `pnpm test:e2e`
   against dev when the operator prerequisites are met.
7. Update `AGENTS.md` (status, repo map, commands) and `docs/PLAN.md` (phase row, decision log);
   write the phase's checklist under `docs/superpowers/plans/`; report; stop.
