# Phase 7 — Notifications & lifecycle — Brief

**Goal (PLAN exit):** overlapping cron runs cannot double-send; marketing and transactional are fully separated.

**Already in place:** `workers/cron` (Cron Triggers → `POST /internal/cron` with `CRON_SHARED_SECRET`), `domain/cron.ts` (`authorizeCron`, `jobsFor`, `runJobs`), `expire_credits()` (idempotent on `expire:lot:{id}`), `finalize_bookings()`, `notification_sends` (`trigger_key` dedupe), `marketing_consents`, `notify/send.ts` (`sendTransactional`, `sendMarketing`), `notify/adapters.ts`, six email templates.

**Questions to open (default first):** reminder timing (24 hours before); low-credit threshold (2); newsletter cadence and copy owner (Artur; unsubscribe and consent copy from legal); re-consent campaign trigger (a new waiver version published).

**Tasks:**
1. Migration 0011: `v_upcoming_reminders`, `v_low_credit_players` read models; harness §17 (a reminder key is written once even when the job runs twice).
2. Jobs in `cron.ts`: `remind_classes`, `nudge_low_credits`, `expire_credits`, `finalize_bookings`, `reconsent_campaign` — each builds `trigger_key`s and calls `sendTransactional`/`sendMarketing`; insert-first dedupe makes overlap safe.
3. Resend adapter (`RESEND_API_KEY` lazy) with the templates ported to text+HTML; dev adapter prints.
4. Portal: `/portal/preferences` (marketing consent on/off), public `/unsubscribe/[token]`.
5. Deploy the cron worker per environment (`pnpm cf deploy --env dev --config workers/cron/wrangler.toml`) with `CRON_SHARED_SECRET` on both sides.

**Operator:** Resend account, verified domain (DNS at GoDaddy), API key; `CRON_SHARED_SECRET`; marketing and unsubscribe copy from legal.
