import { describe, expect, it } from 'vitest';
import { AppError, err, ok } from '../result';
import { called, fakeDb } from '../schedule/fakes';
import { buySchema, startCheckout } from './checkout';
import type { CheckoutRequest, PaymentGateway } from './gateway';

const product = {
	id: 'p1',
	kind: 'class_pack',
	name: 'Weekday classes',
	description: null,
	price_public_cents: 50000,
	price_member_cents: 45000,
	currency: 'usd',
	credit_kind: 'class_weekday',
	credit_quantity: 10,
	credit_validity_days: 84,
	forgiven_skips: 1,
	stripe_price_public: 'price_pub',
	stripe_price_member: 'price_mem',
	active: true
};
const order = {
	id: 'o1',
	status: 'pending',
	amount_total_cents: 45000,
	currency: 'usd',
	created_at: '2026-09-08T10:00:00Z',
	paid_at: null,
	stripe_payment_intent_id: null,
	stripe_checkout_session_id: null,
	accounts: { email: 'family@example.com' },
	order_items: [
		{
			id: 'i1',
			product_id: 'p1',
			quantity: 1,
			unit_amount_cents: 45000,
			player_id: 'pl1',
			products: { name: 'Weekday classes' },
			players: { full_name: 'Eli W.' }
		}
	]
};

function gateway(behaviour: 'ok' | 'fail' = 'ok') {
	const requests: CheckoutRequest[] = [];
	const g: PaymentGateway = {
		kind: 'fake',
		async createCheckout(req) {
			requests.push(req);
			return behaviour === 'ok'
				? ok({ id: 'cs_1', url: 'https://pay.example/cs_1' })
				: err(new AppError('unexpected', 'gateway down'));
		},
		async refund() {
			return ok({ refundId: 're_1' });
		}
	};
	return { g, requests };
}
const deps = (db: ReturnType<typeof fakeDb>, g: PaymentGateway) => ({
	db,
	gateway: g,
	siteUrl: 'https://dev.example',
	email: 'family@example.com'
});

describe('buySchema', () => {
	it('needs a product and a player', () => {
		expect(
			buySchema.safeParse({
				productId: '00000000-0000-4000-8000-000000000501',
				playerId: '00000000-0000-4000-8000-000000000001'
			}).success
		).toBe(true);
		expect(buySchema.safeParse({ productId: 'x', playerId: '' }).success).toBe(false);
	});
});

describe('startCheckout — order first, then the gateway, priced by the order row', () => {
	it('creates the order, sends the priced item and the return urls, and answers with the url', async () => {
		const calls: unknown[] = [];
		const db = fakeDb({
			rpc: { data: 'o1' },
			tables: { orders: { data: order }, products: { data: product } },
			calls
		});
		const { g, requests } = gateway();
		const out = await startCheckout(deps(db, g), { productId: 'p1', playerId: 'pl1' });
		expect(out).toEqual({ ok: true, value: { orderId: 'o1', url: 'https://pay.example/cs_1' } });
		expect(called(calls, 'rpc', 'create_order', { p_product: 'p1', p_player: 'pl1' })).toBe(true);
		expect(requests).toHaveLength(1);
		expect(requests[0]).toEqual({
			orderId: 'o1',
			customerEmail: 'family@example.com',
			currency: 'usd',
			// the member price applied, so the member Stripe price id goes with it
			lineItems: [
				{ name: 'Weekday classes', unitAmountCents: 45000, quantity: 1, stripePriceId: 'price_mem' }
			],
			successUrl: 'https://dev.example/portal/purchases?paid=o1',
			cancelUrl: 'https://dev.example/store?cancelled=o1'
		});
	});

	it('sends the public Stripe price when the public price applied', async () => {
		const publicOrder = {
			...order,
			amount_total_cents: 50000,
			order_items: [{ ...order.order_items[0], unit_amount_cents: 50000 }]
		};
		const db = fakeDb({
			rpc: { data: 'o1' },
			tables: { orders: { data: publicOrder }, products: { data: product } }
		});
		const { g, requests } = gateway();
		await startCheckout(deps(db, g), { productId: 'p1', playerId: 'pl1' });
		expect(requests[0].lineItems[0]).toMatchObject({
			unitAmountCents: 50000,
			stripePriceId: 'price_pub'
		});
	});

	it('a refused order never reaches the gateway', async () => {
		const { g, requests } = gateway();
		const out = await startCheckout(
			deps(fakeDb({ rpc: { error: { message: 'product_inactive' } } }), g),
			{ productId: 'p1', playerId: 'pl1' }
		);
		expect(!out.ok && out.error.code).toBe('product_inactive');
		expect(requests).toHaveLength(0);
	});

	it('when the gateway fails the pending order is cancelled and the failure returned', async () => {
		const calls: unknown[] = [];
		const db = fakeDb({
			rpc: { data: 'o1' },
			tables: { orders: { data: order }, products: { data: product } },
			calls
		});
		const { g } = gateway('fail');
		const out = await startCheckout(deps(db, g), { productId: 'p1', playerId: 'pl1' });
		expect(!out.ok && out.error.code).toBe('unexpected');
		expect(called(calls, 'rpc', 'cancel_order', { p_order: 'o1' })).toBe(true);
	});
});
