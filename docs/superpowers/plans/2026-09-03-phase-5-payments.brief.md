# Phase 5 — Payments — Brief

Expand into a full plan at phase start; post the questions first. Money: every policy question goes to the user with a default.

**Goal (PLAN exit):** test-mode purchase → credits → booking → refund, fully audited; Stripe Payment Links retired.

**Already in place:** `products` (kind, credit quantity/validity/forgiveness, `stripe_price_public/member`), `orders`/`order_items`, `stripe_events`, `payments/webhook.ts` (insert-first idempotency), `payments/store.ts`, `/api/stripe/webhook` (handlers `{}`), lazy `STRIPE_SECRET_KEY` / `STRIPE_WEBHOOK_SECRET`, decisions D (credits on `payment_intent.succeeded` only) and E (Stripe Tax off; refund wording from Artur).

**Questions to open (default first):** Checkout Session vs Payment Element (Checkout, hosted); member price shown to logged-in families only (yes); bank-pay discount amount (from Artur); refund policy text (from Artur/accountant — never drafted here); camp registration purchase in this phase (yes, `camp_registrations.order_item_id`).

**Tasks:**
1. Migration 0009: `create_order(p_product, p_player, p_price_kind)` returning the pending order; `settle_order(p_order)` issuing credits idempotently per order item (calls `issue_credits`); `refund_order_item` writing reversal rows; harness §15 (idempotent settle, refund reversal, camp registration on settle).
2. `domain/payments/checkout.ts` (Checkout Session creation with payment method ordering: `us_bank_account` first, then `card`, `link`, `cashapp`; Apple/Google Pay come with `card`), `domain/payments/handlers.ts` (`checkout.session.completed` → order paid; `payment_intent.succeeded` → `settle_order`; `payment_intent.payment_failed`/`charge.refunded` → reversal rows), wired into the webhook route.
3. Portal: `/portal/store` (products, member price, bank-pay discount shown as a discount), `/portal/purchases` (orders, receipts), receipt email (`payment-receipt` template).
4. Admin: `/admin/products` (CRUD, Stripe price ids), `/admin/orders` (DataTable, drill-in, refund action).
5. e2e with Stripe test cards and the ACH test account; webhook replay proves idempotency.

**Operator:** Stripe test secret key + webhook signing secret as Cloudflare secrets; payment methods enabled in Stripe (ACH Direct Debit activation, Apple Pay domain, Cash App Pay); production Supabase on Pro, standard Postgres, before live (J).
