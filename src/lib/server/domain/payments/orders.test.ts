import { describe, expect, it } from 'vitest';
import { called, fakeDb } from '../schedule/fakes';
import {
	ORDER_STATUS_LABELS,
	cancelOrder,
	createOrder,
	getOrder,
	listOrders,
	orderLots,
	refundable
} from './orders';

const orderRow = {
	id: 'o1',
	account_id: 'acc1',
	status: 'paid',
	amount_total_cents: 50000,
	currency: 'usd',
	created_at: '2026-09-08T10:00:00Z',
	paid_at: '2026-09-08T10:01:00Z',
	stripe_payment_intent_id: 'pi_1',
	stripe_checkout_session_id: 'cs_1',
	accounts: { email: 'family@example.com' },
	order_items: [
		{
			id: 'i1',
			product_id: 'p1',
			quantity: 1,
			unit_amount_cents: 50000,
			player_id: 'pl1',
			products: { name: 'Weekday classes' },
			players: { full_name: 'Eli W.' }
		}
	]
};

describe('createOrder — the database prices it; this names the arguments', () => {
	it('calls create_order and returns the order id', async () => {
		const calls: unknown[] = [];
		const out = await createOrder(fakeDb({ rpc: { data: 'o1' }, calls }), {
			productId: 'p1',
			playerId: 'pl1'
		});
		expect(out).toEqual({ ok: true, value: { orderId: 'o1' } });
		expect(called(calls, 'rpc', 'create_order', { p_product: 'p1', p_player: 'pl1' })).toBe(true);
	});
	it('maps every refusal the RPC raises', async () => {
		for (const token of [
			'unknown_product',
			'product_inactive',
			'unsupported_product',
			'not_authorized',
			'not_authenticated'
		]) {
			const out = await createOrder(fakeDb({ rpc: { error: { message: token } } }), {
				productId: 'p1',
				playerId: 'pl1'
			});
			expect(!out.ok && out.error.code).toBe(token);
		}
	});
});

describe('listOrders / getOrder — one embedded read, RLS decides whose', () => {
	it('reads orders newest first with account, items, products and players embedded', async () => {
		const calls: unknown[] = [];
		const out = await listOrders(fakeDb({ tables: { orders: { data: [orderRow] } }, calls }), {});
		expect(out.ok && out.value).toEqual([
			{
				id: 'o1',
				accountId: 'acc1',
				status: 'paid',
				amountCents: 50000,
				currency: 'usd',
				createdAt: '2026-09-08T10:00:00Z',
				paidAt: '2026-09-08T10:01:00Z',
				paymentIntentId: 'pi_1',
				checkoutSessionId: 'cs_1',
				accountEmail: 'family@example.com',
				items: [
					{
						id: 'i1',
						productId: 'p1',
						productName: 'Weekday classes',
						playerId: 'pl1',
						playerName: 'Eli W.',
						quantity: 1,
						unitAmountCents: 50000
					}
				]
			}
		]);
		const select = calls.find((c) => Array.isArray(c) && c[0] === 'select') as string[];
		expect(select[1]).toContain('account_id');
		expect(select[1]).toContain('accounts ( email )');
		expect(select[1]).toContain('order_items (');
		expect(called(calls, 'order', 'created_at', { ascending: false })).toBe(true);
		expect(called(calls, 'limit', 50)).toBe(true);
		expect(called(calls, 'eq')).toBe(false);
	});
	it('filters by status only when asked, and tolerates a missing account join', async () => {
		const calls: unknown[] = [];
		const out = await listOrders(
			fakeDb({ tables: { orders: { data: [{ ...orderRow, accounts: null }] } }, calls }),
			{ status: 'pending', limit: 10 }
		);
		expect(called(calls, 'eq', 'status', 'pending')).toBe(true);
		expect(called(calls, 'limit', 10)).toBe(true);
		expect(out.ok && out.value[0].accountEmail).toBeNull();
	});
	it('getOrder is one order or null', async () => {
		const calls: unknown[] = [];
		const out = await getOrder(fakeDb({ tables: { orders: { data: orderRow } }, calls }), 'o1');
		expect(out.ok && out.value?.id).toBe('o1');
		expect(called(calls, 'eq', 'id', 'o1')).toBe(true);
		expect(called(calls, 'maybeSingle')).toBe(true);
		expect(await getOrder(fakeDb({ tables: { orders: { data: null } } }), 'nope')).toEqual({
			ok: true,
			value: null
		});
	});
});

describe('cancelOrder', () => {
	it('calls cancel_order and maps its refusals', async () => {
		const calls: unknown[] = [];
		expect(await cancelOrder(fakeDb({ calls }), 'o1')).toEqual({ ok: true, value: undefined });
		expect(called(calls, 'rpc', 'cancel_order', { p_order: 'o1' })).toBe(true);
		const out = await cancelOrder(
			fakeDb({ rpc: { error: { message: 'order_not_pending' } } }),
			'o1'
		);
		expect(!out.ok && out.error.code).toBe('order_not_pending');
	});
});

describe('orderLots / refundable — what a refund may reverse', () => {
	it('reads the purchase lots of the order and their remaining balance', async () => {
		const calls: unknown[] = [];
		const db = fakeDb({
			tables: {
				order_items: { data: [{ id: 'i1' }] },
				credit_ledger: {
					data: [
						{
							id: 'lot1',
							player_id: 'pl1',
							credit_kind: 'class_weekday',
							delta: 10,
							expires_at: '2026-12-08T10:00:00Z',
							order_item_id: 'i1'
						}
					]
				},
				v_lot_remaining: { data: [{ lot_id: 'lot1', remaining: 9 }] }
			},
			calls
		});
		const out = await orderLots(db, 'o1');
		expect(out).toEqual({
			ok: true,
			value: [
				{
					lotId: 'lot1',
					playerId: 'pl1',
					creditKind: 'class_weekday',
					issued: 10,
					remaining: 9,
					expiresAt: '2026-12-08T10:00:00Z'
				}
			]
		});
		expect(called(calls, 'eq', 'order_id', 'o1')).toBe(true);
		expect(called(calls, 'in', 'order_item_id', ['i1'])).toBe(true);
		expect(called(calls, 'eq', 'entry_type', 'purchase')).toBe(true);
		expect(called(calls, 'in', 'lot_id', ['lot1'])).toBe(true);
	});
	it('an order with no items has no lots and reads no ledger', async () => {
		const calls: unknown[] = [];
		const out = await orderLots(fakeDb({ tables: { order_items: { data: [] } }, calls }), 'o1');
		expect(out).toEqual({ ok: true, value: [] });
		expect(called(calls, 'from', 'credit_ledger')).toBe(false);
	});
	it('refundable only while every lot is untouched, and never for nothing', () => {
		const lot = {
			lotId: 'l',
			playerId: 'p',
			creditKind: 'class_weekday' as const,
			issued: 10,
			remaining: 10,
			expiresAt: null
		};
		expect(refundable([lot])).toBe(true);
		expect(refundable([lot, { ...lot, remaining: 9 }])).toBe(false);
		expect(refundable([])).toBe(false);
	});
	it('labels every status in mono caps', () => {
		for (const s of ['pending', 'paid', 'partially_refunded', 'refunded', 'cancelled'] as const)
			expect(ORDER_STATUS_LABELS[s]).toMatch(/^[A-Z ]+$/);
	});
});
