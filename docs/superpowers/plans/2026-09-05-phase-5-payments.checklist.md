# Phase 5 — Payments — Checklist

**Branch:** `phase-5/payments`. **Plan:** `2026-09-05-phase-5-payments.md` — the plan is the spec; every task below refers to it. **State on 2026-09-08:** all fourteen tasks built and green; what remains is the merge, the migration reaching dev, and the credentialed walk-through.

## Done

| task | what | commit (subject — `git log --oneline main..phase-5/payments`) |
| --- | --- | --- |
| 1 | `PAYMENTS_GATEWAY` in config (+ tests), `check-env` refuses `fake` on prod and any profile/env mismatch (both proven), profiles, `.env.development`, `.env.example`, `wrangler.toml` dev var | feat(config): PAYMENTS_GATEWAY selects the simulated or the Stripe gateway; prod cannot select fake |
| 2 | `0009_payments.sql` (catalogue seed, `create_order`, `settle_order`, `cancel_order`, `refund_order`, grants), harness §15 (139 checks total), types regenerated | feat(db): 0009 payments — catalogue, create/settle/cancel/refund order; harness §15 |
| 3 | seven payment error codes and copy | feat(domain): payment error codes and copy |
| 4 | `webhook.ts`: a handler may answer `'skipped'` | feat(payments): a webhook handler may answer skipped |
| 5 | `payments/gateway.ts` (port, `stripeGateway`, `fakeGateway`) + `gateway.runtime.ts` (`selectGateway`) | feat(payments): gateway port with Stripe and simulated adapters |
| 6 | `payments/products.ts` (reads, `productSchema`, `saveProduct`, `formatMoney`, `toCents`, `packFacts`) | feat(payments): catalogue reads, admin schema and money formatting |
| 7 | `payments/orders.ts` (`createOrder`, `listOrders`, `getOrder`, `cancelOrder`, `orderLots`, `refundable`, `ORDER_STATUS_LABELS`) + `payments/checkout.ts` (`buySchema`, `startCheckout`) | feat(payments): orders and checkout |
| 8 | `simulate.ts` (`fakeEvents.paid/expired/refunded`) + `handlers.ts` (`paymentHandlers`, `orderIdOf`) + the webhook route building both per request on the service-role client | feat(payments): Stripe event handlers over the order RPCs; simulated events for the fake gateway |
| 9 | `src/lib/ds/email/paymentReceipt.ts` port + `payments/receipt.ts` (`sendReceipt`, never throws), `onSettled` wired; `OrderSummary` gains `accountId` | feat(payments): payment receipt email, sent once per order |
| 10 | public `/store`; `getAcademySettings` gains `defaultCreditValidityDays` / `defaultForgivenSkips` | feat(store): public catalogue with one checkout action for signed-in guardians |
| 11 | `/portal/checkout/[orderId]` (simulated, 404 elsewhere), `/portal/purchases` + `[id]`, portal tabs, credits banner | feat(portal): simulated checkout, purchases and receipts |
| 12 | `/admin/products` + `[id]`, admin tabs gain Products and Orders | feat(admin): products catalogue |
| 13 | `/admin/orders` + `[id]` with Refund (Dialog + consequence line) and Cancel | feat(admin): orders with refund and cancel |
| 14 | `e2e/family-purchase.test.ts`, OPERATIONS §3a + the split phase-5 readiness rows, AGENTS.md, PLAN.md row and decision log, this checklist | docs(phase-5): operations, records and the purchase walk-through |

Gates at the tip: `pnpm env:check` · `pnpm check` 0/0 · `pnpm lint` · `pnpm test` 379 · `pnpm db:test` 139 · `pnpm db:types` no diff · `pnpm build:dev`.

## Not done — and what it waits on

- **0009 is not on the dev project.** It lands when the branch merges and `deploy/dev` fast-forwards
  (the Supabase GitHub integration applies migrations on push; `pnpm db:push dev` is the fallback).
- **Two e2e specs depend on that.** The anonymous store spec in `smoke.test.ts` asserts the seeded
  catalogue (`Weekday classes` / `$500.00`), and `family-purchase.test.ts` walks the whole exit
  criterion. Both were left asserting the real thing rather than weakened to pass early. Everything
  else in the e2e suite is green, including the two new guarded portal paths and the two new refused
  admin paths.
- **`SUPABASE_SECRET_KEY` is not a dev worker secret** (`pnpm cf secret list --env dev` was empty on
  2026-09-08). Settlement and the receipt run through the service role, so the deployed simulated
  checkout answers 503 without it — and booking confirmations have been silently not sending for the
  same reason since phase 4. `pnpm cf secret put SUPABASE_SECRET_KEY --env dev`. Locally `.env.local`
  already has it.
- **A published waiver version on dev**, as since 0008. The credentialed e2e publishes a placeholder
  if none exists; the real text comes from the academy's lawyer.
- **Real Stripe** — keys, the webhook endpoint, ACH activation and the ACH-first ordering, the
  bank-pay discount, retiring the interim Payment Links, decision E's wording and tax stance. The
  whole path is `docs/OPERATIONS.md` §3a. None of it is needed to exercise phase 5 on dev.

## Notes for whoever continues

- **RED before GREEN, every unit.** Each task landed as: failing test observed → implementation →
  green → one commit. The plan's test bullets are the tests.
- `fakeDb` answers one reply per table and one for every `rpc`. `sendReceipt` was shaped around that
  (orders, credit_ledger, academy_settings — three tables), and it takes an optional `{ store, mailer }`
  so a test can inject both without a Supabase client.
- The generated RPC arg types make `p_payment_intent` and `p_checkout_session` **optional, not
  nullable**. `settle` omits an absent reference rather than sending `null`, which also matches the
  SQL: `coalesce(p_payment_intent, stripe_payment_intent_id)` means an omitted id preserves what the
  order already holds instead of erasing it.
- `DataTable` has no per-column href: `rowHref` links the `mobileTitleKey` column. A `cell` snippet
  takes over **every** cell, so a page that wants a StatusChip in one column must render its own link
  in another (`color: var(--link)` — a raw `text-underline-offset` fails the adherence gate).
- `Toast` takes its text as children (`<Toast bind:open={t}>{$message}</Toast>`), and `StatusChip`
  takes `status` as a prop, not children.
- The route guard in `hooks.server.ts` keys on `event.route.id`, so an `/admin/*` path with no route
  404s publicly instead of redirecting to login. Adding the tab before the route (as task 12 does)
  leaves the refused-paths e2e red for exactly one commit.
- Inside the `(portal)` group, `resolve()` needs the **group** in the route id:
  `resolve('/(portal)/portal/purchases/[id]', { id })`.
- After `saveProduct` inserts, the action writes the new id back into the form, so a second submit on
  `/admin/products/new` updates rather than creating a second product.
