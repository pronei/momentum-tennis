# Build plan — phases, exit criteria, open questions

Working agreement: schema is designed for every phase up front; implementation is
strictly phased; each phase ends with a deliverable on the dev deployment and an
explicit approval gate. Nothing below is built until its phase is approved.

## Phases (reordered 2026-08-31)

Ordering principles: (a) admin must be able to seed the real schedule before any
parent-facing booking exists; (b) booking mechanics are proven on admin-granted
credits before Stripe touches them (Stripe Payment Links bridge revenue
meanwhile); (c) every phase is independently deployable to dev; (d) each phase
maps to one domain module + one additive migration set, so later change is
localized.

| # | Phase | Contents | Depends on | Exit criteria |
|---|-------|----------|------------|---------------|
| 0 | Foundations — **built 2026-09-02** (`phase-0/foundations`) | SvelteKit scaffold, CI (check/lint/test/build), migration 0001 + PGlite harness + generated types, Supabase auth + server guards, domain patterns (Result/AppError, time, identity, booking, cron, payments idempotency, notify), design-system port (core/forms/feedback) + `/styleguide`, integration skeletons (Stripe webhook, cron endpoint + worker), wrangler + workflows | approval of schema v2 ✓ | code exit criteria met (check/lint/test/build green); **operator steps remain**: create the two Supabase projects + two CF projects, fill env/secrets, GitHub secrets for migrate.yml — see docs/superpowers/plans/2026-09-02-phase-0-foundations.md |
| 1 | Identity & profiles — **built 2026-09-02** (`phase-1/identity`) | guardian onboarding, N players per account (add/edit/archive), player switcher and `?player=` context, adult self-guardianship, staff role management; migrations 0002 (player writes) + 0003 (last-admin guard) | 0 | code exit criteria met (check/lint/test/build green, 93 unit + 83 schema checks); **restricted minor login deferred pending question O**; end-to-end on dev still needs the phase-0 operator steps |
| 2 | Waivers — **built 2026-09-02** (`phase-2/waivers`) | document/version admin (draft → publish freeze), signing ceremony with capacity resolved server-side, re-consent detection and banner, status surfaces; migration 0004 (authoring RPCs, hash computed in SQL) | 1 | met: publishing a new version makes every earlier signature stop satisfying the gate, proven in the harness (section 11); `assert_waivers_signed()` and `v_player_waiver_status` are what phase 4 will call, and the portal reads the same view |
| 3 | Schedule & availability — **built 2026-09-03** (`phase-3/schedule`) | locations/courts/availability rules + exceptions, terms/classes/camps/teams CRUD, occurrence generation, ResourceDayView admin editor, public + portal read-only calendars; migration 0007 (atomic level tagging, `v_schedule_sessions`) | 1 (2 for gating copy) | met in code: the whole schedule is enterable through `/admin`, and one read model renders it in academy time for admin, families and the public. 246 unit/contract tests, 109 schema checks. The dev walk-through waits on the first admin account (operator step) |
| 4 | Booking, credits & attendance | scoped class booking with weekly cap, private-lesson booking, cancellation/reversal policy, capacity + waitlist, attendance marking (coach + admin), admin credit grants, booking-confirmation email | 2, 3 | double-booking + cap + waiver gate all enforced by DB under concurrent load; a real week bookable on dev |
| 5 | Payments | Stripe Checkout (ACH-first + cards, Apple Pay, Google Pay, Cash App Pay, Link), idempotent webhooks → ledger issuance, receipts, purchases dashboard + ledger drill-in, refunds/reversals | 4 | test-mode purchase → credits → booking → refund, fully audited; Payment Links interim retired |
| 6 | Ratings & coach tools | rating dimensions admin, coach entry UI, CourtMeter/RatingMeter surfaces, history | 1 | court placement drives the portal meter with accessible text values |
| 7 | Notifications & lifecycle | workers/cron + shared-secret endpoint, class reminders, low-credit nudges, credit expiry rows, re-consent campaigns, newsletter + unsubscribe + preference center | 4 (5 for nudges) | overlapping cron runs cannot double-send; marketing/transactional fully separated |

Deferred (from design-system PRODUCT.md, schema-compatible, unscheduled):
grip-sensor stats ingestion, leaderboard, hero film admin.

## Schema v2 — finalized and validated
The full DDL is `docs/schema/schema-v2.sql` (1,325 lines; becomes
`supabase/migrations/0001_schema.sql` verbatim in phase 0). `docs/schema/validate.mjs`
runs it in PGlite and passes 74 behavioral checks covering: availability gate,
court + coach EXCLUDE, availability-shrink protection, DST-correct occurrence
generation, level tags copied to occurrences + booking gate, waiver gate +
immutable signatures, scoped credits via the single issuance path, the weekly cap,
cancellation policy, one-skip forgiveness on both paths (late cancel, no-show via
finalization), cancel-then-re-book, waitlist promotion, rainout make-whole,
private-lesson conflicts, RLS as a real family login, audit capture, idempotent expiry.

## Resolved decisions (answers of 2026-08-31)
- **A** Scoped packs replace term enrollment for all classes. Each pack = 10 credits
  (`products.credit_quantity`), valid 10 weeks (`products.credit_validity_days` = 70,
  academy default in `academy_settings.default_credit_validity_days`) — configurable.
- **B** Validity runs from issuance (purchase success) and is tracked per lot; expiry
  rows are written by `expire_credits()` (cron), idempotent on `expire:lot:{id}`.
- **C** Consume at booking. Cancel ≥ `cancel_notice_hours` (24) → `cancelled` +
  reversal + weekly cap freed; later → `cancelled_late` (forfeit); academy cancels
  always make players whole (`cancel_session`).
- **D** Credits issue only on `payment_intent.succeeded` (ACH payers wait; cards/wallets
  are instant). No clawback machinery in v1.
- **E** Refund wording + Stripe Tax applicability come from Artur/accountant; Stripe
  Tax stays off until told otherwise.
- **F** Waivers barebones: one required document (`liability`), mechanism supports N.
- **G** Post-18: guardianship links persist until ended; from 18 only `self`
  signatures satisfy the gate; the player's own login gains financial visibility
  automatically (`can_view_financials`).
- **H** Courts belong to a location; Artur reserves a court with the venue first, then
  declares it in `court_availability` (recurring windows, `lesson_bookable` flag,
  `slot_minutes`) / `court_availability_exceptions` (dated closures or extra openings).
  Nothing — class, camp, team, or lesson — can be scheduled on a court outside its
  declared availability (trigger), and availability cannot be shrunk under
  scheduled sessions (cancel them first). Coach availability is not modeled
  (Artur-only assumption) — the coach EXCLUDE constraint still prevents impossible
  schedules.
- **I** Week = ISO Mon–Sun in academy time; weekend = Sat + Sun; families may book
  ahead within `booking_horizon_days` (70).
- **J** Supabase Pro is not required to build. Dev stays on Free. Prod must move to
  Pro ($25/mo) before phase 5 goes live: the Free plan has no backups and pauses
  after 7 idle days — unacceptable once consent records and a money ledger exist.
- **K** Waitlist holds neither credit nor cap; `promote_waitlist` re-checks both.
- **L (2026-09-02)** One skipped week per package is forgiven. Encoded two ways so both
  readings hold: the first forfeit on a package (late cancel via `cancel_booking`, or
  no-show settled by `finalize_bookings` from attendance) writes a `forgive` ledger row
  returning the credit; and validity is extended 7 days per allowance at issuance
  (`issue_credits`: 70 + 7 = 77 days), so a never-booked week doesn't cost a credit
  either. Allowance is per product (`products.forgiven_skips`, academy default 1),
  snapshotted on the lot. Second skip forfeits. Classes only; lesson packs unaffected.
- **M (2026-09-02)** Ball-level taxonomy: orange · green beginner · green intermediate ·
  green advanced · yellow intermediate · yellow advanced (`skill_levels`, ranked). A
  parent sets it when adding a player (`create_player(..., level_key)`, optional);
  only staff move players afterwards (`set_player_level`, audited on `players`).
- **N (2026-09-02)** Slots carry level tags: `class_skill_levels` (template defaults,
  copied onto each generated occurrence) and `session_skill_levels` (per-slot,
  admin select/deselect). Booking requires the player's level to be among the
  slot's tags; an untagged slot is open to all levels; a player without a level
  can only book untagged slots (`level_required`). Replaces the old min/max range.

## Open questions raised by phase 1 (recommended default first)
- **O — how a restricted minor login is created. NOT BUILT; the rest of phase 1 shipped
  without it.** The schema already supports it (an account linked `role='self'` to a minor,
  which `can_view_financials()` correctly starves of money), but `create_player` refuses to
  create that link, so there is deliberately no path to one yet. Recommendation: a
  guardian-initiated invite — the guardian enters the child's email, Supabase sends an
  invite, and on first sign-in an RPC links that account to the named player as `self`,
  allowed only for a player the inviting guardian already guards. Alternatives: no child
  login at all (the family shares the guardian login), or staff-created logins. Blocked
  because it creates an account for a minor.
- **P — what a guardian may edit after the player turns 18.** Implemented as: unchanged.
  The link persists per decision G, so the guardian keeps edit rights until it is ended.
  Alternative: freeze guardian edits at 18 and require the player's own account.
- **Q — birthdate correction.** Implemented as: guardians may correct it, audited on
  `players` — otherwise a typo has no fix without support. The database refuses an edit
  that would leave an account self-guarding a minor.

## Decision log
- 2026-09-03 — Phase 3 built (branch `phase-3/schedule`): migration 0007 adds `set_session_levels`
  / `set_class_levels` (a tag set is replaced in one act — a partial rewrite leaves a slot open to
  every level) and `v_schedule_sessions`, the single `security_invoker` read model the admin grid,
  the portal list and the public page all read. `schedule/` domain module in six files; the
  DataTable, ResourceDayView, SessionForm, ClassTimeline and CampTimeline ports; `/admin/schedule`,
  `/admin/availability`, `/admin/classes`, `/admin/camps`, `/admin/teams`; `/portal/schedule` and
  the public `/schedule`. Decided while building: `sessionSchema` is one flat object with
  refinements rather than a discriminated union (superforms needs a single object shape); the
  console navigates by links so it works without JavaScript; `localInstant` reads the zone offset
  at the answer, not at midnight, so a session on a DST morning lands on the wall clock the form
  asked for. Calendar library: **none** — the spike found `.ec-event` carries a box-shadow and a
  3px radius with no variable to reach them (`docs/decisions/2026-09-03-calendar-library.md`).
  Answers to the phase's six opening questions are in the checklist.
- 2026-09-03 — Dev deployed: https://momentum-tennis-dev.proneidev.workers.dev (worker
  `momentum-tennis-dev`; production will be `momentum-tennis`). Database stays Postgres on Supabase,
  not Workers D1 (`docs/decisions/2026-09-03-postgres-on-supabase-not-d1.md`); Workers KV kept for
  edge caching only. Phase 3 plan written (`docs/superpowers/plans/2026-09-03-phase-3-schedule.md`);
  phases 4–7 have briefs to expand at their start.
- 2026-09-03 — Operations: dev database migrated (0001–0006) with `pnpm db:push` (direct connection,
  no Supabase login); the Supabase GitHub integration on `deploy/dev` is the automatic migration writer
  and `migrate.yml` the manual fallback; `pnpm cf` scopes wrangler to this repo's Cloudflare account;
  `SUPABASE_SERVICE_ROLE_KEY` renamed `SUPABASE_SECRET_KEY`; 0005 moves reference data out of
  `seed.sql` (db push never applies seeds); 0006 captures the RLS safety-net event trigger. Finding:
  the dev project runs Supabase's OrioleDB engine — constraints verified enforced, production must be
  standard Postgres. Handoff for phases 3–7 written: `docs/HANDOFF-opus5.md`.
- 2026-09-02 — Phase 2 built (branch phase-2/waivers): migration 0004 adds the authoring half
  (create_waiver_draft, update_waiver_draft, publish_waiver_version) — version numbers are
  allocated under a document lock and content_sha256 is computed in SQL so the fingerprint
  cannot drift from the signed text. Admin authoring and the portal signing ceremony ship;
  the re-consent banner and the booking gate read one view. 110 unit tests, 99 schema checks.
- 2026-09-02 — Environment profiles: config/dev.yaml and config/prod.yaml describe each
  environment (Supabase project, Cloudflare workers, deploy branch, Stripe mode, secret NAMES);
  `pnpm env:check` binds them to the committed env files and fails if a secret ever carries a
  value in one. Dev Supabase credentials filled in; PUBLIC_SUPABASE_ANON_KEY renamed to
  PUBLIC_SUPABASE_PUBLISHABLE_KEY to match the key Supabase now issues.
- 2026-09-02 — Phase 1 built (branch phase-1/identity): migrations 0002 (update_player,
  archive_player) and 0003 (last-admin guard); identity domain module; portal player
  roster, add/edit, `?player=` context; admin staff console. 93 unit/contract tests and
  83 schema checks green. Two defects found and fixed while building: the PGlite harness
  applied only 0001 (it would have silently ignored every later migration), and the
  adherence checker's font-family rule reported a legal `var(--font-sans)`.
- 2026-08-25 — Calendar: Schedule-X resource view is paid (€479/yr); use
  @event-calendar/core (MIT, Svelte, free resource views) for admin, bespoke
  token-styled month/day views for parents; theming spike opens phase 3.
  **Superseded 2026-09-03 by the spike** (`docs/decisions/2026-09-03-calendar-library.md`):
  no calendar dependency — the ResourceDayView port ships alone.
- 2026-08-25 — Cron: stock adapter-cloudflare has no scheduled() handler →
  dedicated `workers/cron` worker calling a shared-secret internal endpoint.
- 2026-08-30 — Stripe confirmed over Mindbody/CourtReserve/Square. ACH-first,
  cards fallback, bank-pay discount (not surcharge). No ACH installment
  splitting. Interim rail: Stripe Payment Links/Invoices until phase 5.
- 2026-09-02 — Phase 0 built (branch phase-0/foundations): 62 unit/contract tests + 74 schema checks green; types generated locally from migrations via PGlite (scripts/gen-db-types.mjs) so no CLI/project is needed to type the app.
- 2026-09-02 — L/M/N added (forgiveness, ball levels, level-tagged slots); schema revalidated, 74 checks. Harness caught three real bugs: audit trigger uuid cast on the settings singleton, re-booking blocked by session-keyed uniqueness, ledger lookups keyed on session instead of booking.
- 2026-08-31 — Schema v2 finalized and validated in PGlite (59 checks); open questions A–K resolved (see above).
- 2026-08-31 — Design system extension landed (--state-error #A8432D, forms/
  feedback/admin/schedule groups, admin + coach kits, portal flows, email kit).
  Scoped weekday/weekend class packs with 1-per-scope-per-week cap adopted into
  the model (supersedes the packs-vs-term question in its old form).
