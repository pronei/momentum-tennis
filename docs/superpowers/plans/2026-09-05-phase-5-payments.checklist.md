# Phase 5 — Payments — Checklist and handoff

**Branch:** `phase-5/payments` (pushed). **Plan:** `2026-09-05-phase-5-payments.md` — the plan is the spec; every task below refers to it. **State on 2026-09-08:** tasks 1–7 done and green; pick up at Task 8.

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

Gates at the tip: `pnpm env:check` · `pnpm check` 0/0 · `pnpm lint` · `pnpm test` 352 · `pnpm db:test` 139 · `pnpm db:types` no diff · `pnpm build:dev`.

## Next — Task 7 onwards, in the plan's order

8. `simulate.ts` + `handlers.ts` + the webhook route · 9. receipt email port + `receipt.ts` · 10. `/store` · 11. portal checkout, purchases, nav · 12. `/admin/products` · 13. `/admin/orders` · 14. e2e, OPERATIONS, records, finish.

## Notes for whoever continues

- **RED before GREEN, every unit.** Tasks 1–6 each landed as: failing test observed → implementation → green → one commit. Keep that shape; the plan's test bullets are the tests.
- `packFacts(product, defaults)` takes the academy defaults as an argument. `getAcademySettings()` does not yet expose `default_credit_validity_days` / `default_forgiven_skips` — add both (with a `settings.test.ts` case) when building `/store` in Task 10.
- `selectGateway()` reads `PAYMENTS_GATEWAY`; on dev it is `fake` everywhere (env file and worker var). The simulated checkout page (Task 11) and the admin refund (Task 13) run synthetic events through `handleStripeEvent` with the **service-role** client — never the user's.
- The service-role client needs `SUPABASE_SECRET_KEY` on the dev worker (`pnpm cf secret list --env dev` was empty on 2026-09-08). Operator command: `pnpm cf secret put SUPABASE_SECRET_KEY --env dev`. Without it the simulated checkout answers 503 by design.
- The `products` seed uses fixed ids `…0501` (weekday) and `…0502` (weekend); §15 pins their numbers. `stripe_price_*` stay null until Artur enters them.
- 0009 has not been applied to the dev project yet: it lands when the branch merges and `deploy/dev` fast-forwards (the Supabase GitHub integration applies migrations on push), per the ritual in `docs/HANDOFF-opus5.md` §8.
- `orderLots(db, orderId)` reads `order_items` first, then the purchase rows, then `v_lot_remaining` — three reads, one per table, which is what `fakeDb` (one reply per table) can fake.
- Rebase onto `main` before merging if `main` moved; the branch was rebased onto `main` at handoff.
