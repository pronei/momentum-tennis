# Phase 5 — Payments — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A guardian buys a class pack for a named player in the store, pays on a checkout page — simulated on dev until Stripe keys exist, Stripe-hosted after — the webhook pipeline settles the order and issues the credits through `issue_credits`, a receipt goes out, and an admin sees every order, its ledger rows and its Stripe references, and can refund an untouched pack. Every movement of money and credit is a database row the audit trigger saw.

**Architecture:** 0001 already carries the shape of money — `products`, `orders`, `order_items`, `stripe_events`, the append-only `credit_ledger`, `issue_credits` as the one issuance path — and phase 0 built the webhook's insert-first idempotency. Phase 5 adds the order *lifecycle* as four SECURITY DEFINER RPCs in one migration (`create_order`, `settle_order`, `cancel_order`, `refund_order`), a `payments/` domain module whose gateway is a **port** with two adapters (`stripeGateway`, `fakeGateway`), Stripe-shaped handlers that only ever call those RPCs, and the store / purchases / products / orders surfaces. Money is written by the database or the service role, never by a family's client; the app pre-checks only to explain. The simulated gateway is selected by a non-secret variable that production is forbidden to carry.

**Tech Stack:** No new dependencies. `stripe@22` is already installed (webhook verification uses it today). SvelteKit 2 / Svelte 5 runes, superforms + zod4, Supabase RLS client + service-role client, PGlite harness, vitest, Playwright.

**Branch:** `phase-5/payments` from `main`. **Migration:** `0009_payments.sql`. **Harness:** section 15.

---

## What the record says, and what changed on 2026-09-05

The brief was blocked on inputs (prices, discount, refund wording, Stripe keys). The user resolved the ones that matter for building:

- **Catalogue:** two products for now — *Weekday classes* $500 · 12 weeks · 10 credits, *Weekend classes* $700 · 12 weeks · 10 credits; one forgiven skip each.
- **Stripe:** scaffold against mock data now; the real keys, ACH Direct Debit and the other payment methods follow *after* Stripe is wired. So the gateway is a port, the fake adapter is the one exercised on dev, and the Stripe adapter is unit-tested against a fake client only.
- Still from Artur/the accountant, and therefore **not built**: the bank-pay discount amount (moot until ACH), refund policy wording and Stripe Tax (decision E). The refund *mechanism* is built with the narrowest policy that needs no wording.

---

## Opening questions (recommended default first)

**Answered 2026-09-05:** questions 1–4 were put to the user and every recommended default was confirmed; 5–11 stand as stated defaults. Tasks below assume every recommended answer.

1. **"Valid 12 weeks" — what number goes on the product?** Recommended: `credit_validity_days = 84`, and decision L's 7 days per forgiven skip apply as already designed, so a lot expires 91 days after purchase. The store says `VALID 12 WEEKS · 1 FORGIVEN SKIP (+1 WEEK)` and every receipt shows the exact date. Alternative: store 77 so the lot expires exactly 12 weeks out — the admin form then shows a number Artur never said.
2. **What may Refund do in this phase?** Recommended: a paid order refunds **in full, only while no credit from it has been drawn or expired**; the credits reverse as `refund` rows when Stripe confirms the refund. A pack with a used credit is a manual matter — an `adjust` row at `/admin/credits` and a refund in the Stripe dashboard — until Artur states a rule. Alternative: pro-rata by unused credits (needs his rule for the money; stop and ask).
3. **The simulated gateway must be impossible in production.** Recommended: `PAYMENTS_GATEWAY=fake|stripe` (default `stripe`) as a non-secret variable; `pnpm env:check` refuses `fake` on the `prod` profile and refuses a profile/env mismatch; `wrangler.toml` sets `fake` for `[env.dev]` only. The fake path additionally runs only through the service-role client, so a family's client can never settle its own order.
4. **The catalogue is seeded by migration 0009**, idempotently, with fixed ids, Stripe price ids left null — like 0005's reference data. Recommended yes: every environment gets the same two rows and Artur edits them at `/admin/products`. Alternative: enter them by hand on each environment.
5. **Member price = public price for now.** `price_member_cents` stays null on both packs; the code shows the member price to signed-in guardians *when a product has one*. Yes.
6. **Camp and team-fee purchases are deferred.** `create_order` refuses `camp`/`team_fee` with `unsupported_product`; camps stay admin-registered. Reason: a camp seat needs a capacity hold between order and settlement (`camp_registrations` has no pending status), which is its own small design, and no camp product exists. Recommended yes.
7. **Bank-pay discount deferred with ACH.** Nothing in the store mentions it. Yes.
8. **Payment methods are dashboard-managed** on the real gateway: the Checkout Session names no `payment_method_types`, so Stripe offers what the dashboard has enabled (cards, Apple/Google Pay, Link now; ACH once activated). The ACH-first ordering the brief wanted becomes a one-line, tested change when ACH exists. Yes.
9. **Stripe-hosted Checkout, not Payment Element** — card data never touches the site (PRODUCT.md §14). Yes.
10. **One pack per order.** `order_items.quantity` stays 1; a family buying two packs makes two orders, each its own lot with its own expiry. Yes.
11. **The receipt goes to the buying account's email only**, keyed `receipt:order:{id}` so a replayed webhook cannot send twice. Yes.

---

## File structure

**Migration & harness**
- Create `supabase/migrations/0009_payments.sql` — catalogue rows, `create_order`, `settle_order`, `cancel_order`, `refund_order`, grants.
- Modify `supabase/tests/validate.mjs` — section 15.
- Regenerate `src/lib/server/db/database.types.ts` (`pnpm db:types`).

**Config**
- Modify `src/lib/server/config.ts` (+ `config.test.ts`) — `PAYMENTS_GATEWAY`.
- Modify `scripts/check-env.mjs`, `config/dev.yaml`, `config/prod.yaml`, `.env.development`, `.env.example`, `wrangler.toml`.

**Domain — `src/lib/server/domain/payments/`** (each with a sibling `*.test.ts`)
- Modify `webhook.ts` — a handler may answer `'skipped'`.
- Create `gateway.ts` — the port, `stripeGateway`, `fakeGateway`. Create `gateway.runtime.ts` — `selectGateway()` (wiring only, untested).
- Create `products.ts` — catalogue reads, admin schema and save, money formatting, pack facts.
- Create `orders.ts` — `createOrder`, `listOrders`, `getOrder`, `cancelOrder`, `orderLots`, `refundable`.
- Create `checkout.ts` — `startCheckout` (order → gateway → url), `buySchema`.
- Create `simulate.ts` — Stripe-shaped synthetic events for the fake gateway.
- Create `handlers.ts` — event type → RPC.
- Create `receipt.ts` — `sendReceipt` (never throws).
- Modify `src/lib/server/domain/result.ts` — seven codes.

**Email**
- Create `src/lib/ds/email/paymentReceipt.ts` (+ test in `email.test.ts`) — port of `design-system/templates/email/payment-receipt.html`.

**Routes**
- Create `src/routes/store/` — public store; buy action when signed in.
- Create `src/routes/(portal)/portal/checkout/[orderId]/` — the simulated checkout (fake gateway only).
- Create `src/routes/(portal)/portal/purchases/` and `purchases/[id]/`.
- Create `src/routes/admin/products/` and `products/[id]/`; `src/routes/admin/orders/` and `orders/[id]/`.
- Modify `src/routes/api/stripe/webhook/+server.ts`, `src/routes/admin/+layout.svelte`, `src/routes/(portal)/portal/+layout.svelte`, `src/routes/(portal)/portal/credits/+page.svelte`.

**Tests & docs**
- Create `e2e/family-purchase.test.ts`; modify `e2e/smoke.test.ts`.
- Modify `docs/OPERATIONS.md` (§3 Stripe go-live, §7 phase-5 row), `AGENTS.md`, `docs/PLAN.md`; create the phase checklist.

---

### Task 1: Config — `PAYMENTS_GATEWAY`

**Files:** Modify `src/lib/server/config.ts`, `src/lib/server/config.test.ts`, `scripts/check-env.mjs`, `config/dev.yaml`, `config/prod.yaml`, `.env.development`, `.env.example`, `wrangler.toml`.

- [ ] **Step 1: Failing tests** in `config.test.ts`:
  - `parseEnv(core)` (no `PAYMENTS_GATEWAY`) → `paymentsGateway === 'stripe'`.
  - `parseEnv({ ...core, PAYMENTS_GATEWAY: 'fake' })` → `'fake'`.
  - `parseEnv({ ...core, PAYMENTS_GATEWAY: 'sandbox' })` throws a message containing `PAYMENTS_GATEWAY`.
- [ ] **Step 2: Run** `pnpm vitest run src/lib/server/config.test.ts` → FAIL (property missing / no throw).
- [ ] **Step 3: Implement.**

```ts
// config.ts — additions
export const GATEWAYS = ['stripe', 'fake'] as const;
export type GatewayKind = (typeof GATEWAYS)[number];
// in `schema`:
//   PAYMENTS_GATEWAY: z.enum(GATEWAYS).default('stripe'),
// in `Config`:
//   /** 'fake' renders a simulated checkout and settles through the service role. Never in production. */
//   paymentsGateway: GatewayKind;
// in parseEnv's return: paymentsGateway: v.PAYMENTS_GATEWAY,
```

  `scripts/check-env.mjs`, inside the per-profile loop after the secret-leak check:

```js
// The simulated gateway is a dev convenience with a blast radius: it issues credits without
// money. The profile must name the gateway the env file selects, and production may never
// select the fake one — even by accident of a copied env file.
const gateway = env.PAYMENTS_GATEWAY || 'stripe';
const declared = profile.payments?.gateway ?? 'stripe';
if (gateway !== declared) {
	console.error(`  ✗ ${profile.env_file} selects PAYMENTS_GATEWAY=${gateway} but the profile declares ${declared}`);
	errors++;
}
if (name === 'prod' && gateway === 'fake') {
	console.error('  ✗ production cannot run the simulated payment gateway');
	errors++;
}
```

  `config/dev.yaml`: add under `stripe:` a sibling block `payments:\n  gateway: fake # simulated checkout; credits settle through the service role — see docs/OPERATIONS.md §3`. `config/prod.yaml`: `payments:\n  gateway: stripe`. `.env.development`: `PAYMENTS_GATEWAY=fake`. `.env.example`: `PAYMENTS_GATEWAY=stripe             # fake = simulated checkout, dev only`. `wrangler.toml` under `[env.dev.vars]`: `PAYMENTS_GATEWAY = "fake"` with a one-line comment; nothing under `[env.live.vars]` (the default is `stripe`).
- [ ] **Step 4: Run** the config test → PASS; `pnpm env:check` → both profiles report, 0 errors.
- [ ] **Step 5: Commit** — `git commit -m "feat(config): PAYMENTS_GATEWAY selects the simulated or the Stripe gateway; prod cannot select fake"`

### Task 2: Migration 0009 — the order lifecycle, and harness §15

**Files:** Create `supabase/migrations/0009_payments.sql`; modify `supabase/tests/validate.mjs`; regenerate `src/lib/server/db/database.types.ts`.

- [ ] **Step 1: Failing harness section.** Append section 15 before the final summary line of `validate.mjs`. Every check below is RED until the migration exists (the RPCs are undefined). The fixtures `ADMIN`, `PARENT`, `PARENT2`, `v2`, `loc`, `term`, `monday`, `D` are in scope from earlier sections; `monday` is the Monday two weeks out, so every generated occurrence is in the future.

```js
console.log('15. payments — catalogue, orders, settlement, refunds (0009)');

// (a) the catalogue Artur specified is present, once, with the numbers the store will show
const WEEKDAY_PACK = '00000000-0000-4000-8000-000000000501';
const WEEKEND_PACK = '00000000-0000-4000-8000-000000000502';
const p5cat = (
	await q(
		`select name, price_public_cents, price_member_cents, credit_kind, credit_quantity,
		        credit_validity_days, forgiven_skips, active
		   from products where id in ($1, $2) order by price_public_cents`,
		[WEEKDAY_PACK, WEEKEND_PACK]
	)
).rows;
if (
	p5cat.length === 2 &&
	p5cat[0].name === 'Weekday classes' && p5cat[0].price_public_cents === 50000 && p5cat[0].credit_kind === 'class_weekday' &&
	p5cat[1].name === 'Weekend classes' && p5cat[1].price_public_cents === 70000 && p5cat[1].credit_kind === 'class_weekend' &&
	p5cat.every((p) => p.credit_quantity === 10 && p.credit_validity_days === 84 && p.forgiven_skips === 1 && p.price_member_cents === null && p.active)
)
	ok('the two class packs are seeded with their prices, credits, validity and forgiveness');
else {
	console.log('  ✗ catalogue', p5cat);
	failures++;
}

// (b) an order is priced by the database from the catalogue, for a player the caller guards
await asUser(PARENT);
const p5player = (await q(`select create_player('Eli W.', '2015-03-03', 'parent') as id`)).rows[0].id;
await q(`select sign_waiver($1,$2,'Priya R.')`, [v2, p5player]);
const p5order = (await q(`select create_order($1,$2) as id`, [WEEKDAY_PACK, p5player])).rows[0].id;
const p5row = (
	await q(
		`select o.status, o.amount_total_cents, o.currency, i.unit_amount_cents, i.quantity, i.player_id
		   from orders o join order_items i on i.order_id = o.id where o.id = $1`,
		[p5order]
	)
).rows[0];
if (
	p5row.status === 'pending' && p5row.amount_total_cents === 50000 && p5row.unit_amount_cents === 50000 &&
	p5row.quantity === 1 && p5row.player_id === p5player && p5row.currency === 'usd'
)
	ok('create_order: a pending order at the catalogue price, one item, quantity one, the named player');
else {
	console.log('  ✗ order', p5row);
	failures++;
}
await asUser(PARENT2);
await expectErr(
	'a guardian cannot buy for a player they do not guard',
	() => q(`select create_order($1,$2)`, [WEEKDAY_PACK, p5player]),
	'not_authorized'
);
await db.exec('set role authenticated');
const p5hidden = (await q(`select count(*)::int as n from orders where id = $1`, [p5order])).rows[0].n;
await db.exec('reset role');
if (p5hidden === 0) ok('RLS: another family cannot see the order');
else {
	console.log('  ✗ order visible across families', p5hidden);
	failures++;
}
await asUser(null);
await expectErr(
	'anonymous cannot order',
	() => q(`select create_order($1,$2)`, [WEEKDAY_PACK, p5player]),
	'not_authenticated'
);
await asUser(ADMIN);
await q(`update products set active = false where id = $1`, [WEEKEND_PACK]);
const p5camp = (
	await q(
		`insert into products (kind, name, price_public_cents) values ('camp', 'P5 camp week', 100) returning id`
	)
).rows[0].id;
await asUser(PARENT);
await expectErr(
	'an inactive product cannot be ordered',
	() => q(`select create_order($1,$2)`, [WEEKEND_PACK, p5player]),
	'product_inactive'
);
await expectErr(
	'a camp is not sold online in this phase',
	() => q(`select create_order($1,$2)`, [p5camp, p5player]),
	'unsupported_product'
);
await asUser(ADMIN);
await q(`update products set active = true where id = $1`, [WEEKEND_PACK]);

// (c) settlement: money confirmed → credits, exactly once
await asUser(PARENT);
await expectErr(
	'a family cannot settle its own order',
	() => q(`select settle_order($1)`, [p5order]),
	'admin_only'
);
await asUser(null); // the webhook: service role, no user
const p5settle = (await q(`select settle_order($1,'pi_test_1','cs_test_1') as r`, [p5order])).rows[0].r;
const p5lot = (
	await q(
		`select delta, forgiven_skips, stripe_payment_intent_id, idempotency_key,
		        round(extract(epoch from (expires_at - now())) / 86400)::int as days
		   from credit_ledger
		  where order_item_id = (select id from order_items where order_id = $1)`,
		[p5order]
	)
).rows;
const p5paid = (
	await q(`select status, paid_at, stripe_payment_intent_id, stripe_checkout_session_id from orders where id = $1`, [p5order])
).rows[0];
if (
	p5settle.status === 'paid' && p5settle.issued === 1 && p5lot.length === 1 && p5lot[0].delta === 10 &&
	p5lot[0].days === 91 && p5lot[0].forgiven_skips === 1 && p5lot[0].stripe_payment_intent_id === 'pi_test_1' &&
	p5paid.status === 'paid' && p5paid.paid_at && p5paid.stripe_payment_intent_id === 'pi_test_1' &&
	p5paid.stripe_checkout_session_id === 'cs_test_1'
)
	ok('settle_order: paid with its Stripe refs, ten credits issued once, expiring 84 + 7 days out');
else {
	console.log('  ✗ settle', p5settle, p5lot, p5paid);
	failures++;
}
const p5again = (await q(`select settle_order($1,'pi_test_1') as r`, [p5order])).rows[0].r;
const p5purchases = (
	await q(
		`select count(*)::int as n from credit_ledger
		  where entry_type = 'purchase' and order_item_id in (select id from order_items where order_id = $1)`,
		[p5order]
	)
).rows[0].n;
if (p5again.status === 'paid' && p5again.issued === 0 && p5purchases === 1)
	ok('a replayed settlement issues nothing: keyed on the order item');
else {
	console.log('  ✗ replay', p5again, p5purchases);
	failures++;
}
const p5bal = (
	await q(`select balance from v_credit_balances where player_id = $1 and credit_kind = 'class_weekday'`, [p5player])
).rows[0]?.balance;
if (p5bal === 10) ok('the family balance reads ten weekday credits');
else {
	console.log('  ✗ balance', p5bal);
	failures++;
}

// (d) refunds follow the policy: only a pack nobody has drawn on
await asUser(ADMIN);
const p5court = (await q(`insert into courts (location_id, name) values ($1,'MP-5') returning id`, [loc])).rows[0].id;
await q(
	`insert into court_availability (court_id, weekday, open_local, close_local, effective_from)
	 values ($1, 2, '16:00', '20:00', $2)`,
	[p5court, monday]
);
const p5class = (
	await q(
		`insert into classes (term_id, name, weekday, start_time_local, duration_minutes, capacity, default_court_id)
		 values ($1,'P5 Tue',2,'16:00',90,3,$2) returning id`,
		[term, p5court]
	)
).rows[0].id;
await q(`select generate_class_sessions($1,$2,$3)`, [p5class, monday, D.next_sunday]);
const p5sid = (
	await q(
		`select cs.session_id from class_sessions cs join sessions s on s.id = cs.session_id
		  where cs.class_id = $1 and s.starts_at > now() order by s.starts_at limit 1`,
		[p5class]
	)
).rows[0].session_id;
await asUser(PARENT);
const p5booking = (await q(`select book_class($1,$2) as id`, [p5player, p5sid])).rows[0].id;
await asUser(null);
await expectErr(
	'a pack with a consumed credit is not refunded here',
	() => q(`select refund_order($1)`, [p5order]),
	'credits_already_used'
);
await asUser(PARENT);
await q(`select cancel_booking('class', $1)`, [p5booking]); // ≥ notice → reversal; the pack is whole again
await expectErr(
	'a family cannot refund itself',
	() => q(`select refund_order($1)`, [p5order]),
	'admin_only'
);
await asUser(null);
const p5refund = (await q(`select refund_order($1, 'test refund') as r`, [p5order])).rows[0].r;
const p5after = (
	await q(`select coalesce(sum(delta),0)::int as n from credit_ledger where player_id = $1 and credit_kind = 'class_weekday'`, [p5player])
).rows[0].n;
const p5refundRow = (
	await q(`select entry_type, delta, idempotency_key from credit_ledger where entry_type = 'refund' and player_id = $1`, [p5player])
).rows;
const p5status = (await q(`select status from orders where id = $1`, [p5order])).rows[0].status;
if (
	p5refund.status === 'refunded' && p5refund.reversed === 1 && p5after === 0 && p5status === 'refunded' &&
	p5refundRow.length === 1 && p5refundRow[0].delta === -10 && p5refundRow[0].idempotency_key.startsWith('refund:lot:')
)
	ok('refund_order: an untouched pack reverses in full as a refund row and the order reads refunded');
else {
	console.log('  ✗ refund', p5refund, p5after, p5status, p5refundRow);
	failures++;
}
const p5refund2 = (await q(`select refund_order($1) as r`, [p5order])).rows[0].r;
if (p5refund2.status === 'refunded' && p5refund2.reversed === 0) ok('a replayed refund reverses nothing');
else {
	console.log('  ✗ refund replay', p5refund2);
	failures++;
}
await expectErr(
	'the ledger stays append-only for refund rows',
	() => q(`update credit_ledger set delta = -1 where entry_type = 'refund' and player_id = $1`, [p5player]),
	'append-only'
);

// (e) an abandoned checkout is cancelled by its buyer; settled orders are not
await asUser(PARENT);
const p5o2 = (await q(`select create_order($1,$2) as id`, [WEEKDAY_PACK, p5player])).rows[0].id;
await asUser(PARENT2);
await expectErr(
	'another family cannot cancel it',
	() => q(`select cancel_order($1)`, [p5o2]),
	'not_authorized'
);
await asUser(PARENT);
await q(`select cancel_order($1)`, [p5o2]);
await q(`select cancel_order($1)`, [p5o2]);
const p5o2s = (await q(`select status from orders where id = $1`, [p5o2])).rows[0].status;
if (p5o2s === 'cancelled') ok('cancel_order: the buyer abandons a pending order; a second cancel is a no-op');
else {
	console.log('  ✗ cancel', p5o2s);
	failures++;
}
await asUser(null);
await expectErr(
	'a cancelled order cannot be settled',
	() => q(`select settle_order($1)`, [p5o2]),
	'order_not_pending'
);
await expectErr(
	'a settled order cannot be cancelled',
	() => q(`select cancel_order($1)`, [p5order]),
	'order_not_pending'
);
await expectErr(
	'only a paid order can be refunded',
	() => q(`select refund_order($1)`, [p5o2]),
	'order_not_paid'
);

// (f) every step left an audit row: insert, paid, refunded
const p5audit = (await q(`select count(*)::int as n from audit_log where entity_id = $1`, [p5order])).rows[0].n;
if (p5audit >= 3) ok('orders are audited through their whole life');
else {
	console.log('  ✗ audit rows', p5audit);
	failures++;
}
```

- [ ] **Step 2: Run** `pnpm db:test` → section 15 fails at `create_order` ("function … does not exist"). Sections 1–14 still pass.
- [ ] **Step 3: Write the migration.**

```sql
-- ═══════════════════════════════════════════════════════════════════════════
-- Momentum Tennis — 0009: payments (phase 5)
--
-- 0001 carries the SHAPE of money — products, orders, order_items, stripe_events,
-- the append-only credit_ledger and issue_credits as the one issuance path — but
-- no way to move an order through its life. This migration adds that, and nothing
-- else:
--
--   • the catalogue Artur specified (two class packs), as reference data with
--     fixed ids, so every environment shares them and /admin/products edits them;
--   • create_order — a guardian's intent, priced by the DATABASE from the
--     catalogue, never from the form;
--   • settle_order — money confirmed → credits, exactly once: keyed on the order
--     item, so a replayed webhook or a second settlement cannot issue twice;
--   • cancel_order — an abandoned or failed checkout; nothing was issued, so
--     nothing reverses;
--   • refund_order — money went back (Stripe said so) → the credits come back
--     too, as refund rows, and only for a pack nobody has drawn on.
--
-- The family-facing function checks its caller; the settlement functions accept
-- only the service role (no user) or an admin. Append-only: never edit this file
-- once applied — add 0010.
-- ═══════════════════════════════════════════════════════════════════════════

-- ───────────────────────────── catalogue ─────────────────────────
-- Stripe price ids stay null: they differ per Stripe account and are entered in the console.
insert into products (id, kind, name, description, price_public_cents, currency,
                      credit_kind, credit_quantity, credit_validity_days, forgiven_skips)
values
  ('00000000-0000-4000-8000-000000000501', 'class_pack', 'Weekday classes',
   '10 class credits, Monday to Friday. Valid 12 weeks from purchase; one skipped week forgiven.',
   50000, 'usd', 'class_weekday', 10, 84, 1),
  ('00000000-0000-4000-8000-000000000502', 'class_pack', 'Weekend classes',
   '10 class credits, Saturday and Sunday. Valid 12 weeks from purchase; one skipped week forgiven.',
   70000, 'usd', 'class_weekend', 10, 84, 1)
on conflict (id) do nothing;

-- ───────────────────────────── create_order ──────────────────────
create function public.create_order(p_product uuid, p_player uuid)
returns uuid language plpgsql security definer set search_path = public as $$
declare v_account uuid := auth.uid(); v_p products%rowtype; v_price int; v_order uuid;
begin
  if v_account is null then raise exception 'not_authenticated'; end if;
  -- the beneficiary is a named player the caller guards AND may see money for: a minor's own
  -- restricted login guards itself, but can_view_financials says no (G)
  if not guards(p_player) or not can_view_financials(p_player) then
    raise exception 'not_authorized';
  end if;
  select * into v_p from products where id = p_product;
  if not found then raise exception 'unknown_product'; end if;
  if not v_p.active then raise exception 'product_inactive'; end if;
  if v_p.kind not in ('class_pack', 'lesson_pack') then raise exception 'unsupported_product'; end if;
  -- a signed-in guardian is a member; the member price applies whenever the catalogue has one
  v_price := coalesce(v_p.price_member_cents, v_p.price_public_cents);
  insert into orders (account_id, amount_total_cents, currency)
    values (v_account, v_price, v_p.currency) returning id into v_order;
  insert into order_items (order_id, product_id, player_id, quantity, unit_amount_cents)
    values (v_order, p_product, p_player, 1, v_price);
  return v_order;
end $$;

-- ───────────────────────────── settle_order ──────────────────────
create function public.settle_order(p_order uuid, p_payment_intent text default null,
                                    p_checkout_session text default null)
returns jsonb language plpgsql security definer set search_path = public as $$
declare v_o orders%rowtype; v_i record; v_issued int := 0;
begin
  if auth.uid() is not null and not is_admin() then raise exception 'admin_only'; end if;
  select * into v_o from orders where id = p_order for update;
  if not found then raise exception 'unknown_order'; end if;
  if v_o.status = 'cancelled' then raise exception 'order_not_pending'; end if;
  if v_o.status = 'pending' then
    update orders
       set status = 'paid', paid_at = now(),
           stripe_payment_intent_id   = coalesce(p_payment_intent, stripe_payment_intent_id),
           stripe_checkout_session_id = coalesce(p_checkout_session, stripe_checkout_session_id)
     where id = p_order;
  end if;
  -- keyed on the ORDER ITEM: a replayed event, a second settle, or a run that died half-way
  -- issues nothing twice — issue_credits returns null when the key already exists
  for v_i in
    select oi.id, oi.player_id, oi.product_id, oi.quantity, p.credit_kind, p.credit_quantity
      from order_items oi join products p on p.id = oi.product_id
     where oi.order_id = p_order and p.kind in ('class_pack', 'lesson_pack')
  loop
    if issue_credits(v_i.player_id, v_i.credit_kind, v_i.credit_quantity * v_i.quantity,
                     'purchase:order_item:' || v_i.id, v_i.product_id, v_i.id,
                     p_payment_intent, null) is not null then
      v_issued := v_issued + 1;
    end if;
  end loop;
  return jsonb_build_object('status', 'paid', 'issued', v_issued);
end $$;

-- ───────────────────────────── cancel_order ──────────────────────
create function public.cancel_order(p_order uuid)
returns void language plpgsql security definer set search_path = public as $$
declare v_o orders%rowtype;
begin
  select * into v_o from orders where id = p_order for update;
  if not found then raise exception 'unknown_order'; end if;
  -- the buyer may abandon their own checkout; an admin or the service role may expire anyone's
  if auth.uid() is not null and v_o.account_id <> auth.uid() and not is_admin() then
    raise exception 'not_authorized';
  end if;
  if v_o.status = 'cancelled' then return; end if;
  if v_o.status <> 'pending' then raise exception 'order_not_pending'; end if;
  update orders set status = 'cancelled' where id = p_order;
end $$;

-- ───────────────────────────── refund_order ──────────────────────
-- Policy (phase 5, until Artur states a rule): a pack refunds in full only while nobody has
-- drawn on it. A pack with a consumed or expired credit is a manual matter — an adjust row
-- and a dashboard refund — never a computed guess here.
create function public.refund_order(p_order uuid, p_reason text default null)
returns jsonb language plpgsql security definer set search_path = public as $$
declare v_o orders%rowtype; v_lot record; v_reversed int := 0;
begin
  if auth.uid() is not null and not is_admin() then raise exception 'admin_only'; end if;
  select * into v_o from orders where id = p_order for update;
  if not found then raise exception 'unknown_order'; end if;
  if v_o.status = 'refunded' then return jsonb_build_object('status', 'refunded', 'reversed', 0); end if;
  if v_o.status <> 'paid' then raise exception 'order_not_paid'; end if;
  for v_lot in
    select r.lot_id, r.player_id, r.credit_kind, r.issued, r.remaining
      from v_lot_remaining r
      join credit_ledger l on l.id = r.lot_id
     where l.order_item_id in (select id from order_items where order_id = p_order)
  loop
    if v_lot.remaining <> v_lot.issued then raise exception 'credits_already_used'; end if;
    insert into credit_ledger (player_id, entry_type, delta, credit_kind, lot_id,
                               idempotency_key, reason, created_by)
    values (v_lot.player_id, 'refund', -v_lot.remaining, v_lot.credit_kind, v_lot.lot_id,
            'refund:lot:' || v_lot.lot_id, coalesce(p_reason, 'order refunded'), auth.uid())
    on conflict (idempotency_key) do nothing;
    v_reversed := v_reversed + 1;
  end loop;
  update orders set status = 'refunded' where id = p_order;
  return jsonb_build_object('status', 'refunded', 'reversed', v_reversed);
end $$;

-- ───────────────────────────── grants ────────────────────────────
-- 0001's blanket revoke covered only the functions that existed then; a new function is
-- created with EXECUTE for PUBLIC, so each one is revoked and granted here explicitly.
revoke execute on function public.create_order(uuid, uuid)          from public, anon;
grant  execute on function public.create_order(uuid, uuid)          to authenticated;
revoke execute on function public.settle_order(uuid, text, text)    from public, anon;
grant  execute on function public.settle_order(uuid, text, text)    to authenticated, service_role;
revoke execute on function public.cancel_order(uuid)                from public, anon;
grant  execute on function public.cancel_order(uuid)                to authenticated, service_role;
revoke execute on function public.refund_order(uuid, text)          from public, anon;
grant  execute on function public.refund_order(uuid, text)          to authenticated, service_role;
```

- [ ] **Step 4: Run** `pnpm db:test` → `ALL CHECKS PASSED`, sections 1–15 (about 136 checks). If (d)'s `book_class` refuses with `session_not_bookable`, the occurrence picked is not in the future — the query already filters `starts_at > now()`; check that `term` covers `monday`.
- [ ] **Step 5: Types.** `pnpm db:types` → `database.types.ts` gains the four functions; `git diff --stat` shows only that file.
- [ ] **Step 6: Commit** — `git commit -m "feat(db): 0009 payments — catalogue, create/settle/cancel/refund order; harness §15"`

### Task 3: Error codes

**Files:** Modify `src/lib/server/domain/result.ts`, `result.test.ts`.

- [ ] **Step 1: Failing test** — `fromPostgres({ message: 'credits_already_used' }).code === 'credits_already_used'`, and `describeError` returns a non-empty string for each of `unknown_product`, `product_inactive`, `unsupported_product`, `unknown_order`, `order_not_pending`, `order_not_paid`, `credits_already_used`; assert no copy string contains `!`.
- [ ] **Step 2: Run** → FAIL (`unexpected`).
- [ ] **Step 3: Implement** — add the seven codes to `CODES` (before `conflict`) and their copy:
  - `unknown_product`: `That package does not exist.`
  - `product_inactive`: `That package is no longer on sale.`
  - `unsupported_product`: `That item cannot be bought online yet. Contact the academy.`
  - `unknown_order`: `That order does not exist.`
  - `order_not_pending`: `That order has already been settled or cancelled.`
  - `order_not_paid`: `Only a paid order can be refunded.`
  - `credits_already_used`: `Credits from this order have been used or have expired, so it cannot be refunded here. Adjust the ledger and refund in Stripe by hand.`
- [ ] **Step 4: Run** → PASS. **Step 5: Commit** — `git commit -m "feat(domain): payment error codes and copy"`

### Task 4: `webhook.ts` — a handler may skip

**Files:** Modify `src/lib/server/domain/payments/webhook.ts`, `webhook.test.ts`.

Why: the interim Payment Links live in the same Stripe account, so this endpoint will receive `checkout.session.completed` events carrying no `order_id`. A handler that throws makes Stripe retry for days; one that returns `'skipped'` records the honest outcome.

- [ ] **Step 1: Failing test** — a handler that returns `'skipped'` yields outcome `'skipped'` and the store settles the id as `skipped`.
- [ ] **Step 2: Run** → FAIL (`processed`).
- [ ] **Step 3: Implement** — `export type StripeHandler = (event: StripeEventLike) => Promise<void | 'skipped'>;` and in `handleStripeEvent`: `const out = await handler(event); await store.settle(event.id, out === 'skipped' ? 'skipped' : 'processed'); return out === 'skipped' ? 'skipped' : 'processed';` (the try/catch stays as is).
- [ ] **Step 4: Run** → 5 tests PASS. **Step 5: Commit** — `git commit -m "feat(payments): a webhook handler may answer skipped"`

### Task 5: `payments/gateway.ts` — the port and both adapters

**Files:** Create `src/lib/server/domain/payments/gateway.ts`, `gateway.test.ts`, `gateway.runtime.ts`.

- [ ] **Step 1: Failing tests**
  - `fakeGateway('https://dev.example').createCheckout({ orderId: 'o1', … })` → `ok({ id: 'cs_fake_o1', url: 'https://dev.example/portal/checkout/o1' })`; `.refund({ orderId: 'o1', … })` → `ok({ refundId: 're_fake_o1' })`; `kind === 'fake'`.
  - `stripeGateway(fakeStripe).createCheckout(req)` calls `checkout.sessions.create` **once** with `mode: 'payment'`, `client_reference_id: req.orderId`, `customer_email`, `metadata.order_id` and `payment_intent_data.metadata.order_id` both `req.orderId`, `success_url`/`cancel_url`, a `line_items` entry using `{ price: stripePriceId, quantity }` when the product has a Stripe price and `price_data { currency, unit_amount, product_data.name }` otherwise, **no** `payment_method_types` key (dashboard-managed — question 8), and the option `{ idempotencyKey: 'checkout:' + orderId }`; returns `{ id, url }` from the session.
  - A session with `url: null` → `err('unexpected')`; a thrown SDK error → `err('unexpected', message)`, never a throw.
  - `.refund` calls `refunds.create({ payment_intent, amount, metadata: { order_id } }, { idempotencyKey: 'refund:' + orderId })`.
- [ ] **Step 2: Run** → module missing.
- [ ] **Step 3: Implement.**

```ts
import { AppError, err, ok, type Result } from '../result';

export type CheckoutRequest = {
	orderId: string;
	customerEmail: string;
	currency: string;
	lineItems: { name: string; unitAmountCents: number; quantity: number; stripePriceId: string | null }[];
	successUrl: string;
	cancelUrl: string;
};
export type CheckoutSession = { id: string; url: string };
export type RefundRequest = { orderId: string; paymentIntentId: string; amountCents: number };

/** What the app needs from a payment provider. Money moves behind this line; credits never do. */
export interface PaymentGateway {
	readonly kind: 'stripe' | 'fake';
	createCheckout(req: CheckoutRequest): Promise<Result<CheckoutSession>>;
	refund(req: RefundRequest): Promise<Result<{ refundId: string }>>;
}

/** The slice of the Stripe SDK the adapter touches — tests hand in a fake of exactly this. */
export type StripeLike = {
	checkout: {
		sessions: {
			create(
				params: Record<string, unknown>,
				opts?: { idempotencyKey?: string }
			): Promise<{ id: string; url: string | null }>;
		};
	};
	refunds: {
		create(params: Record<string, unknown>, opts?: { idempotencyKey?: string }): Promise<{ id: string }>;
	};
};

const failure = (e: unknown) => err(new AppError('unexpected', e instanceof Error ? e.message : String(e)));

export function stripeGateway(stripe: StripeLike): PaymentGateway {
	return {
		kind: 'stripe',
		async createCheckout(req) {
			try {
				const session = await stripe.checkout.sessions.create(
					{
						mode: 'payment',
						client_reference_id: req.orderId,
						customer_email: req.customerEmail,
						metadata: { order_id: req.orderId },
						// the PaymentIntent carries the order too: its events may arrive before the session's
						payment_intent_data: { metadata: { order_id: req.orderId } },
						line_items: req.lineItems.map((li) =>
							li.stripePriceId
								? { price: li.stripePriceId, quantity: li.quantity }
								: {
										quantity: li.quantity,
										price_data: {
											currency: req.currency,
											unit_amount: li.unitAmountCents,
											product_data: { name: li.name }
										}
									}
						),
						success_url: req.successUrl,
						cancel_url: req.cancelUrl
					},
					{ idempotencyKey: `checkout:${req.orderId}` }
				);
				if (!session.url) return err(new AppError('unexpected', 'Stripe returned no checkout url'));
				return ok({ id: session.id, url: session.url });
			} catch (e) {
				return failure(e);
			}
		},
		async refund(req) {
			try {
				const refund = await stripe.refunds.create(
					{ payment_intent: req.paymentIntentId, amount: req.amountCents, metadata: { order_id: req.orderId } },
					{ idempotencyKey: `refund:${req.orderId}` }
				);
				return ok({ refundId: refund.id });
			} catch (e) {
				return failure(e);
			}
		}
	};
}

/** Dev only: the "hosted page" is our own /portal/checkout/[orderId]; refunds succeed on paper. */
export function fakeGateway(siteUrl: string): PaymentGateway {
	return {
		kind: 'fake',
		async createCheckout(req) {
			return ok({ id: `cs_fake_${req.orderId}`, url: `${siteUrl}/portal/checkout/${req.orderId}` });
		},
		async refund(req) {
			return ok({ refundId: `re_fake_${req.orderId}` });
		}
	};
}
```

  `gateway.runtime.ts` (wiring, no unit test — it only reads config and constructs):

```ts
import Stripe from 'stripe';
import { getConfig, secretOr503 } from '$lib/server/config.runtime';
import { fakeGateway, stripeGateway, type PaymentGateway, type StripeLike } from './gateway';

/** The gateway this environment runs. 'fake' is refused for production by pnpm env:check. */
export function selectGateway(): PaymentGateway {
	const cfg = getConfig();
	if (cfg.paymentsGateway === 'fake') return fakeGateway(cfg.siteUrl);
	const key = secretOr503('STRIPE_SECRET_KEY', 'Stripe');
	return stripeGateway(new Stripe(key, { httpClient: Stripe.createFetchHttpClient() }) as StripeLike);
}
```

  If `svelte-check` rejects the `as StripeLike` cast (method parameter types are bivariant, so it should not), wrap the client in a two-method object literal instead of widening the type.
- [ ] **Step 4: Run** → PASS. **Step 5: Commit** — `git commit -m "feat(payments): gateway port with Stripe and simulated adapters"`

### Task 6: `payments/products.ts`

**Files:** Create `src/lib/server/domain/payments/products.ts`, `products.test.ts`.

- [ ] **Step 1: Failing tests** (with `fakeDb` / `called` from `../schedule/fakes`):
  - `listProducts(db, { activeOnly: true })` reads `products` with `.eq('active', true)`, ordered by `price_public_cents`, mapping snake to camel (`Product`). Without the flag no `eq` call is made (admin sees inactive rows too).
  - `getProduct(db, id)` → `ok(Product | null)`.
  - `productSchema`: `name` 1–80 chars; `kind` in `class_pack | lesson_pack | camp | team_fee`; `priceDollars` a number ≥ 0 with at most 2 decimals; `memberPriceDollars` optional; for pack kinds `creditKind`, `creditQuantity` (1–100) are required and the schema's `refine` says so (mirrors 0001's check constraint for UX; the database is the authority); `validityDays` and `forgivenSkips` optional integers; `stripePricePublic`/`stripePriceMember` optional strings matching `/^price_[A-Za-z0-9]+$/`; `active` boolean.
  - `saveProduct(db, input)` inserts when `id` is absent and updates `.eq('id', id)` otherwise, converting dollars to cents (`toCents(500) === 50000`, `toCents(19.99) === 1999` — no float drift); a `23514` becomes `validation`, a `42501` becomes `not_authorized`.
  - `formatMoney(50000)` → `$500.00`; `formatMoney(1999, 'usd')` → `$19.99`.
  - `packFacts({ creditQuantity: 10, creditValidityDays: 84, forgivenSkips: 1 })` → `10 CREDITS · VALID 12 WEEKS · 1 FORGIVEN SKIP (+1 WEEK)`; with `forgivenSkips: 0` → no third segment; with null validity, `academyDefaultDays` is used.
- [ ] **Step 2: Run** → FAIL. **Step 3: Implement** (`toCents = (d) => Math.round(d * 100)`; `Product` carries `pricePublicCents, priceMemberCents, currency, creditKind, creditQuantity, creditValidityDays, forgivenSkips, stripePricePublic, stripePriceMember, active, kind, name, description`).
- [ ] **Step 4: Run** → PASS. **Step 5: Commit** — `git commit -m "feat(payments): catalogue reads, admin schema and money formatting"`

### Task 7: `payments/orders.ts` and `payments/checkout.ts`

**Files:** Create `orders.ts`, `orders.test.ts`, `checkout.ts`, `checkout.test.ts` under `src/lib/server/domain/payments/`.

- [ ] **Step 1: Failing tests — orders**
  - `createOrder(db, { productId, playerId })` calls `rpc('create_order', { p_product, p_player })` → `ok({ orderId })`; maps `unknown_product`, `product_inactive`, `unsupported_product`, `not_authorized`, `not_authenticated`.
  - `listOrders(db, { status?, limit = 50 })` reads `orders` with the embedded select `id, status, amount_total_cents, currency, created_at, paid_at, stripe_payment_intent_id, stripe_checkout_session_id, accounts ( email ), order_items ( id, quantity, unit_amount_cents, player_id, products ( name ), players ( full_name ) )`, ordered by `created_at` desc, `.eq('status', status)` only when given; returns `OrderSummary[]` (`accountEmail` null when the join is absent — a family is not allowed to read `accounts` of others and does not need to).
  - `getOrder(db, id)` → the same shape for one order or null.
  - `cancelOrder(db, id)` → `rpc('cancel_order', { p_order })`, maps `order_not_pending`, `not_authorized`.
  - `orderLots(db, orderId)` reads `credit_ledger` purchase rows whose `order_item_id` belongs to the order (`.in('order_item_id', itemIds)`), then `v_lot_remaining` `.in('lot_id', lotIds)` → `{ lotId, playerId, creditKind, issued, remaining, expiresAt }[]`.
  - `refundable(lots)` — pure — true only when every lot has `remaining === issued`; false for an empty list.
  - `ORDER_STATUS_LABELS` covers all five statuses in mono caps.
- [ ] **Step 2: Failing tests — checkout**
  - `startCheckout({ db, gateway, siteUrl, email }, { productId, playerId })`: calls `create_order`, then reads the product (name, price, currency, stripe price id, member price applied when present — the amount comes from the order row, not the product), then `gateway.createCheckout` with `successUrl = siteUrl + '/portal/purchases?paid=' + orderId` and `cancelUrl = siteUrl + '/store?cancelled=' + orderId`, and returns `ok({ orderId, url })`.
  - When the gateway fails, the order is cancelled (`rpc('cancel_order')`) and the gateway error is returned — a pending order that will never be paid must not linger.
  - `buySchema` requires `productId` and `playerId` uuids.
- [ ] **Step 3: Run** → FAIL. **Step 4: Implement.** The line item sent to the gateway is `{ name: product.name, unitAmountCents: order.items[0].unitAmountCents, quantity: 1, stripePriceId: memberPriceApplied ? product.stripePriceMember : product.stripePricePublic }`.
- [ ] **Step 5: Run** → PASS. **Step 6: Commit** — `git commit -m "feat(payments): orders and checkout"`

### Task 8: `payments/simulate.ts`, `payments/handlers.ts`, and the webhook route

**Files:** Create `simulate.ts`, `simulate.test.ts`, `handlers.ts`, `handlers.test.ts`; modify `src/routes/api/stripe/webhook/+server.ts`.

- [ ] **Step 1: Failing tests — simulate**
  - `fakeEvents.paid('o1')` is a `StripeEventLike` with `type: 'checkout.session.completed'`, an id starting `evt_fake_`, `data.object.client_reference_id === 'o1'`, `payment_status: 'paid'`, `payment_intent: 'pi_fake_o1'`, `id: 'cs_fake_o1'`, `metadata.order_id: 'o1'`. Two calls produce two ids.
  - `fakeEvents.expired('o1')` → `checkout.session.expired` with the same session fields.
  - `fakeEvents.refunded('o1')` → `charge.refunded` with `refunded: true`, `payment_intent: 'pi_fake_o1'`, `metadata.order_id: 'o1'`.
- [ ] **Step 2: Failing tests — handlers** (`paymentHandlers({ db: fakeDb(...), onSettled })`, asserting on `calls`):
  - `checkout.session.completed` with `payment_status: 'paid'` → `rpc('settle_order', { p_order, p_payment_intent, p_checkout_session })`; when the rpc answers `{ issued: 1 }`, `onSettled(orderId)` is awaited; when `{ issued: 0 }` it is not (a replay sends no second receipt).
  - `checkout.session.completed` with `payment_status: 'unpaid'` (ACH pending) → **no** settle; the session and intent ids are attached with `from('orders').update({...}).eq('id', orderId)` (service role) so the order can be found when the async event lands.
  - `checkout.session.async_payment_succeeded` and `payment_intent.succeeded` → settle (the latter reads `metadata.order_id` from the intent and passes its `id` as the intent).
  - `checkout.session.expired` and `checkout.session.async_payment_failed` → `rpc('cancel_order')`; an `order_not_pending` refusal (already paid by the other path) is swallowed, not thrown.
  - `charge.refunded` with `refunded: true` → `rpc('refund_order', { p_order, p_reason: 'refunded in Stripe' })`; the order id comes from `metadata.order_id`, else from `orders` by `stripe_payment_intent_id`; a partial refund (`refunded: false`) → `'skipped'`.
  - Any event whose object carries no order id (a Payment Link sale) → `'skipped'`.
  - A settle refusal (`unknown_order`) is **thrown** as an `AppError` so the event is recorded as `error` and Stripe retries — the honest outcome for a real inconsistency.
- [ ] **Step 3: Run** → FAIL. **Step 4: Implement.**

```ts
// handlers.ts — shape
export type HandlerDeps = {
	/** service-role client: there is no user in a webhook */
	db: Pick<SupabaseClient<Database>, 'from' | 'rpc'>;
	/** runs once per order, when settlement actually issued credits */
	onSettled: (orderId: string) => Promise<void>;
};
type SessionLike = { id: string; client_reference_id?: string | null; payment_status?: string; payment_intent?: string | null; metadata?: Record<string, string> | null };
type IntentLike = { id: string; metadata?: Record<string, string> | null };
type ChargeLike = { id: string; refunded?: boolean; payment_intent?: string | null; metadata?: Record<string, string> | null };

export const orderIdOf = (o: { metadata?: Record<string, string> | null; client_reference_id?: string | null }) =>
	o.metadata?.order_id ?? o.client_reference_id ?? null;

export function paymentHandlers(deps: HandlerDeps): StripeHandlers { /* per the tests above */ }
```

  Webhook route: replace `const handlers: StripeHandlers = {};` with a per-request construction after the signature check:

```ts
const admin = createAdminSupabase();
const handlers = paymentHandlers({
	db: admin,
	onSettled: (orderId) => sendReceipt(admin, getConfig(), orderId).then(() => undefined)
});
```

  (`sendReceipt` arrives in Task 9; until then wire `onSettled: async () => {}` and the commit for this task says so.)
- [ ] **Step 5: Run** → PASS; `pnpm check` clean. **Step 6: Commit** — `git commit -m "feat(payments): Stripe event handlers over the order RPCs; simulated events for the fake gateway"`

### Task 9: The receipt — email port and sender

**Files:** Create `src/lib/ds/email/paymentReceipt.ts`; modify `src/lib/ds/email/email.test.ts`; create `src/lib/server/domain/payments/receipt.ts`, `receipt.test.ts`.

- [ ] **Step 1: Failing tests — template.** `paymentReceipt({ orderRef: 'ORDER 3F2A9C1B', items: [{ name: 'Weekday classes', playerName: 'Eli W.', amount: '$500.00' }], total: '$500.00', date: '2026-09-05', creditsLine: '10 CREDITS ISSUED · ELI W. · EXPIRES 2026-12-05', stripeRef: 'PI_FAKE_…', receiptUrl })` → subject `Receipt — Weekday classes · $500.00`; `text` contains every fact (item, player, total, date, credits line, Stripe ref, url) in mono-style label rows like `bookingConfirmation`; `html` carries the same facts, the navy header bar as text (the same deviation `bookingConfirmation` records), the amber pill CTA "View receipt" (the email kit's one sanctioned radius), and the footer lines from the reference; no `!` anywhere; `creditsLine: null` and `stripeRef: null` omit their rows.
- [ ] **Step 2: Failing tests — sender.** `sendReceipt(admin, cfg, orderId)`: reads the order with items and the account email (service role), the purchase lots' `expires_at`, builds the receipt with `formatMoney`, `academyDate`, and calls `sendTransactional` with `triggerKey: 'receipt:order:' + orderId`, `template: 'payment-receipt'`, `to: account.email`, `recipientAccountId`, `playerId` of the first item; returns `true` on `'sent'`, `false` on `'duplicate'`; **never throws** — a missing email or a mailer failure returns `false`. Use `consoleMailer` when `RESEND_API_KEY` is absent, exactly as `notifyBooking` does (extract nothing yet; two call sites is not a pattern).
- [ ] **Step 3: Run** → FAIL. **Step 4: Implement.** The order ref shown is `ORDER ` + the first 8 hex characters of the id, upper-cased — a uuid is not something a family should read in full.
- [ ] **Step 5: Wire** `onSettled` in the webhook route to `sendReceipt` (Task 8 left a stub). **Step 6: Run** `pnpm test` → PASS. **Step 7: Commit** — `git commit -m "feat(payments): payment receipt email, sent once per order"`

### Task 10: Public `/store`

**Files:** Create `src/routes/store/+page.server.ts`, `+page.svelte`.

- [ ] **Step 1: Failing e2e** in `smoke.test.ts`: `/store` renders anonymously and shows both pack names and `$500.00` / `$700.00`; the one action reads `Log in to buy` and points at `/login?next=/store`.
- [ ] **Step 2: Implement.**
  - `load`: `listProducts(locals.supabase, { activeOnly: true })`; when `locals.user`, also `listPlayers(locals.supabase, locals.user.id)` (adults and minors alike — a guardian buys for any player they guard; the RPC refuses a restricted self-login) and a superform of `buySchema` with `productId` defaulting to the first pack. `academySettings.defaultCreditValidityDays` feeds `packFacts` for products with null validity. `?cancelled=` renders a Banner: `CHECKOUT CANCELLED — nothing was charged.`
  - Action `buy`: no user → `redirect(303, '/login?next=/store')`; validate; `startCheckout({ db: locals.supabase, gateway: selectGateway(), siteUrl: cfg.siteUrl, email: locals.user.email }, form.data)`; error → `setError(form, '', describeError(code))`; success → `redirect(303, url)`.
  - Page: `Eyebrow ticks` "Store", a lede in sentence case, a 2-up grid (one column below 760px) of pack cards — hairline, square, name, mono price, mono `packFacts`, the description; below them **one** form: `SegmentedControl` for the pack (options from the products), `Select` for the player, and the single amber `Button` `Continue to payment`. Signed-in guardians see the member price where a product has one, labelled `MEMBER PRICE`, with the public price struck in mono. Anonymous: the amber action is `Log in to buy`. No JS is required for any of it.
- [ ] **Step 3: Run** `pnpm test:e2e -g "store"` → PASS; `pnpm check` and `pnpm lint` clean (adherence gate: tokens only; `ds-allow` any card column floor as `/portal/credits` does).
- [ ] **Step 4: Commit** — `git commit -m "feat(store): public catalogue with one checkout action for signed-in guardians"`

### Task 11: Portal — simulated checkout, purchases, receipt page, navigation

**Files:** Create `src/routes/(portal)/portal/checkout/[orderId]/+page.server.ts`, `+page.svelte`; `src/routes/(portal)/portal/purchases/+page.server.ts`, `+page.svelte`, `purchases/[id]/+page.server.ts`, `+page.svelte`. Modify `src/routes/(portal)/portal/+layout.svelte`, `src/routes/(portal)/portal/credits/+page.svelte`, `e2e/smoke.test.ts`.

- [ ] **Step 1: Failing e2e** in `smoke.test.ts`: `/portal/purchases` and `/portal/checkout/00000000-0000-4000-8000-000000000000` redirect anonymous users to `/login?next=…` (extend the existing guarded-paths test).
- [ ] **Step 2: Simulated checkout.**
  - `load`: `getConfig().paymentsGateway !== 'fake'` → `error(404)` — on a Stripe environment this page does not exist. `getOrder(locals.supabase, params.orderId)` under the user's RLS → null → 404. Return the order and whether it is still `pending`.
  - Actions `pay` and `abandon`: `createAdminSupabase()` inside a try — a missing `SUPABASE_SECRET_KEY` → `error(503, 'Simulated checkout is not configured for this environment')`; re-read the order **through the user's client** and refuse (`fail(400)`) unless `pending` and owned; then `handleStripeEvent(supabaseEventStore(admin), fakeEvents.paid(id) | fakeEvents.expired(id), paymentHandlers({ db: admin, onSettled: sendReceipt… }))`; `pay` → `redirect(303, '/portal/purchases?paid=' + id)`, `abandon` → `redirect(303, '/store?cancelled=' + id)`.
  - Page: a `Banner` that says, in mono, `SIMULATED CHECKOUT · DEV ONLY · NO MONEY MOVES`; the order facts (item, player, amount, ref); when pending: the amber `Pay` and a ghost `Abandon`; otherwise its status chip and a link to purchases.
- [ ] **Step 3: Purchases.** `load`: `listOrders(locals.supabase, {})` (RLS scopes to the account), mapped to rows `{ on, item, player, amount, status }`; `?paid=` → `Banner`: `PAID · CREDITS ISSUED` with a ghost `See credits` action. Page: `DataTable` with a mono ref column linking to `/portal/purchases/[id]`; `EmptyState` `NO PURCHASES YET`. `[id]`: the receipt facts (the same fields the email carries) plus the lots from `orderLots` with expiry dates; 404 when the order is not the account's.
- [ ] **Step 4: Navigation and the credits banner.** Portal tabs gain `Store` (`/store`) after `Credits` and `Purchases` (`/portal/purchases`) after it. In `/portal/credits/+page.svelte` replace the phase-4 banner text with `No credits yet.` and its action with `Button size="sm" variant="ghost" href="/store"` → `Buy a pack`.
- [ ] **Step 5: Run** `pnpm test:e2e -g "guarded"` → PASS; `pnpm check`, `pnpm lint` clean.
- [ ] **Step 6: Commit** — `git commit -m "feat(portal): simulated checkout, purchases and receipts"`

### Task 12: Admin — `/admin/products`

**Files:** Create `src/routes/admin/products/+page.server.ts`, `+page.svelte`, `products/[id]/+page.server.ts`, `+page.svelte`; modify `src/routes/admin/+layout.svelte`, `e2e/smoke.test.ts`.

- [ ] **Step 1: Failing e2e** in `smoke.test.ts`: `/admin/products` and `/admin/orders` are refused for anonymous users (extend the refused-paths test).
- [ ] **Step 2: Implement.** List: `listProducts(db, {})` → `DataTable` (name, kind, price, credits, validity, active as a `StatusChip`, Stripe price present as `SET`/`—`), a ghost `New product` linking to `/admin/products/new`. `[id]`: `new` → empty superform of `productSchema` (kind `class_pack`, active true); otherwise `getProduct` → 404 or the form pre-filled (cents → dollars). Action `save` → `saveProduct` → `message(form, 'SAVED · ' + name)`; a refusal → `setError(form, '', describeError(code))`. The form: `FormSection` "The product" (name, kind, description), "Price" (public and member dollars), "Credits" (kind, quantity, validity days with help `blank = academy default`, forgiven skips), "Stripe" (two price ids with help `price_… from the Stripe dashboard; blank = the amount is sent inline`), `Checkbox` active. Admin tabs gain `Products` before `Credits` and `Orders` after it.
- [ ] **Step 3: Run** e2e + `pnpm check` + `pnpm lint` → clean. **Step 4: Commit** — `git commit -m "feat(admin): products catalogue"`

### Task 13: Admin — `/admin/orders` with refund and cancel

**Files:** Create `src/routes/admin/orders/+page.server.ts`, `+page.svelte`, `orders/[id]/+page.server.ts`, `+page.svelte`.

- [ ] **Step 1: Implement the list.** `load`: `?status=` → `listOrders(db, { status })`; `DataTable` (date, account email, player, item, amount, status chip) with a GET form of `Select` for the status filter and a mono ref column linking to `[id]`.
- [ ] **Step 2: Implement the detail.** `load`: `getOrder` (404), `orderLots`, `refundable(lots)`, the Stripe refs, the ledger rows for the lots (`credit_ledger` `.in('lot_id', …)` plus the purchase rows themselves), and the gateway kind (so the page can say what Refund will do). Actions:
  - `refund`: re-read the order and lots; refuse unless `status === 'paid'` and `refundable` (`fail(400, { reason: describeError('credits_already_used') })`); `selectGateway().refund({ orderId, paymentIntentId, amountCents })` → error → `fail(502, …)`; then, **fake gateway only**, run `fakeEvents.refunded(orderId)` through `handleStripeEvent` with the admin client (the real gateway's `charge.refunded` arrives at the webhook) → `message`: fake → `REFUNDED · CREDITS REVERSED`; stripe → `REFUND REQUESTED · credits reverse when Stripe confirms`.
  - `cancel`: `cancelOrder(db, id)` → message `CANCELLED`.
  - Page: facts, items, the lots with `issued / remaining / expires`, the ledger rows, and a `Dialog` for Refund following the design rule — a secondary outlined button with `--state-error` text and the mono consequence line `10 CREDITS REVERSE · $500.00 RETURNS THROUGH STRIPE`; amber never confirms a reversal. When not refundable, the button is absent and a `Banner tone="error"` carries `describeError('credits_already_used')`.
- [ ] **Step 3: Run** `pnpm check`, `pnpm lint` → clean. **Step 4: Commit** — `git commit -m "feat(admin): orders with refund and cancel"`

### Task 14: e2e, operations, and the finish

**Files:** Create `e2e/family-purchase.test.ts`; modify `docs/OPERATIONS.md`, `AGENTS.md`, `docs/PLAN.md`; create `docs/superpowers/plans/2026-09-05-phase-5-payments.checklist.md`.

- [ ] **Step 1: The purchase walk-through** (skips without `E2E_ADMIN_EMAIL`/`E2E_ADMIN_PASSWORD`, like `family-booking`): log in → ensure a published waiver (reuse the phase-4 block) → add a player → sign → `/store` → choose `Weekday classes`, the player, `Continue to payment` → the simulated checkout shows `SIMULATED CHECKOUT` → `Pay` → `/portal/purchases` shows `PAID · CREDITS ISSUED` and the row → `/portal/credits` shows `10` → `/portal/book` book the first weekday class → `/admin/orders`, open the order → Refund is absent and the banner explains → `/portal/bookings` cancel → back at the order, Refund → confirm → `REFUNDED · CREDITS REVERSED` → `/portal/credits` shows `0` and a `refund` row.
- [ ] **Step 2: Run** `pnpm test:e2e` against the local server → the new spec skips without credentials; with them against dev it passes end to end.
- [ ] **Step 3: Operations.** `docs/OPERATIONS.md` §7 phase-5 row becomes two: *to exercise on dev now* — `SUPABASE_SECRET_KEY` as a dev worker secret (`pnpm cf secret put SUPABASE_SECRET_KEY --env dev`; settlement and the receipt run through the service role; without it the simulated checkout answers 503) and the published waiver; *to go live with Stripe* — a new §3 subsection: test then live secret key, a webhook endpoint at `https://<host>/api/stripe/webhook` subscribed to `checkout.session.completed`, `checkout.session.async_payment_succeeded`, `checkout.session.async_payment_failed`, `checkout.session.expired`, `payment_intent.succeeded`, `charge.refunded`, its signing secret, `PAYMENTS_GATEWAY` removed from the environment (default `stripe`), payment methods enabled in the dashboard (cards + wallets first; ACH Direct Debit activation, then the ordering change), the Payment Links retired the day the store opens, decision E's wording and tax stance before live, decision J's Pro plan before live.
- [ ] **Step 4: Gates.** `pnpm env:check` · `pnpm check` (0/0) · `pnpm lint` · `pnpm test` · `pnpm db:test` · `pnpm db:types` no diff · `pnpm build:dev`.
- [ ] **Step 5: Records.** `AGENTS.md` status (phases 0–5, 0009 applied, `PAYMENTS_GATEWAY`, the refund policy, what is still Artur's); repo map (`payments/`, `/store`, `/admin/products`, `/admin/orders`); `docs/PLAN.md` phase-5 row and decision-log entries for questions 1–11 as answered; the checklist file.
- [ ] **Step 6: Finish.** Merge to `main`, `git branch -f deploy/dev main`, push both; confirm 0009 on the dev project; report; **stop**.

---

## Self-review

**Spec coverage.** Brief task 1 (0009 with create/settle/refund + harness) → Task 2, with `cancel_order` added because abandoned checkouts are the common case, and camp settlement dropped per question 6. Task 2 (checkout + handlers wired into the route) → Tasks 5, 7, 8; the ACH-first method ordering is deferred with ACH (question 8). Task 3 (store, purchases, receipt) → Tasks 9–11; the bank-pay discount is deferred (question 7). Task 4 (products CRUD, orders with refund) → Tasks 12–13. Task 5 (e2e with test cards, webhook replay) → Task 14 walks the simulated gateway end to end; replay is pinned by the harness (§15 c, d) and `webhook.test.ts`, and the Stripe test-card run is an operator step once keys exist. PLAN exit "test-mode purchase → credits → booking → refund, fully audited" is the e2e's exact sequence; "Payment Links retired" is the operator's last step in §3.

**Placeholders.** None: every RPC, every test bullet and every route load/action is specified; the only "later" items are the ones the user deferred (ACH ordering, discount, camps), each named as a question.

**Type consistency.** `startCheckout` returns `{ orderId, url }` (Task 7) and `/store` redirects to `url` (Task 10). `paymentHandlers({ db, onSettled })` (Task 8) is constructed identically in the webhook route, the simulated checkout (Task 11) and the admin refund (Task 13). `fakeEvents.paid/expired/refunded` (Task 8) are the only synthetic shapes. `orderLots` + `refundable` (Task 7) are what Task 13 reads. `settle_order` returns `{ status, issued }` and `refund_order` `{ status, reversed }` in both SQL and the handler tests. `packFacts` (Task 6) is used by the store (Task 10) and the receipt's credits line is built from lot rows, not from `packFacts`.
