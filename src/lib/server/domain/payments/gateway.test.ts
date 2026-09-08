import { describe, expect, it } from 'vitest';
import { fakeGateway, stripeGateway, type CheckoutRequest, type StripeLike } from './gateway';

const req: CheckoutRequest = {
	orderId: 'o1',
	customerEmail: 'family@example.com',
	currency: 'usd',
	lineItems: [
		{ name: 'Weekday classes', unitAmountCents: 50000, quantity: 1, stripePriceId: null }
	],
	successUrl: 'https://dev.example/portal/purchases?paid=o1',
	cancelUrl: 'https://dev.example/store?cancelled=o1'
};

type Call = { method: string; params: Record<string, unknown>; opts?: { idempotencyKey?: string } };

/** The slice of the SDK the adapter touches, recording every call. */
function fakeStripe(behaviour: { url?: string | null; throwOn?: 'session' | 'refund' } = {}) {
	const calls: Call[] = [];
	const stripe: StripeLike = {
		checkout: {
			sessions: {
				create: async (params, opts) => {
					calls.push({ method: 'sessions.create', params, opts });
					if (behaviour.throwOn === 'session') throw new Error('rate_limit');
					return {
						id: 'cs_123',
						url:
							behaviour.url === undefined ? 'https://checkout.stripe.com/c/cs_123' : behaviour.url
					};
				}
			}
		},
		refunds: {
			create: async (params, opts) => {
				calls.push({ method: 'refunds.create', params, opts });
				if (behaviour.throwOn === 'refund') throw new Error('charge_already_refunded');
				return { id: 're_123' };
			}
		}
	};
	return { stripe, calls };
}

describe('fakeGateway — the simulated checkout lives on our own site', () => {
	it('sends the family to /portal/checkout/[orderId] and refunds on paper', async () => {
		const g = fakeGateway('https://dev.example');
		expect(g.kind).toBe('fake');
		expect(await g.createCheckout(req)).toEqual({
			ok: true,
			value: { id: 'cs_fake_o1', url: 'https://dev.example/portal/checkout/o1' }
		});
		expect(
			await g.refund({ orderId: 'o1', paymentIntentId: 'pi_fake_o1', amountCents: 50000 })
		).toEqual({ ok: true, value: { refundId: 're_fake_o1' } });
	});
});

describe('stripeGateway — a Checkout Session that names the order everywhere', () => {
	it('creates one session: order id on the session and on the intent, amount inline, no payment_method_types', async () => {
		const { stripe, calls } = fakeStripe();
		const out = await stripeGateway(stripe).createCheckout(req);
		expect(out).toEqual({
			ok: true,
			value: { id: 'cs_123', url: 'https://checkout.stripe.com/c/cs_123' }
		});
		expect(calls).toHaveLength(1);
		const { params, opts } = calls[0];
		expect(params.mode).toBe('payment');
		expect(params.client_reference_id).toBe('o1');
		expect(params.customer_email).toBe('family@example.com');
		expect(params.metadata).toEqual({ order_id: 'o1' });
		expect(params.payment_intent_data).toEqual({ metadata: { order_id: 'o1' } });
		expect(params.success_url).toBe(req.successUrl);
		expect(params.cancel_url).toBe(req.cancelUrl);
		// payment methods are dashboard-managed until ACH is activated (plan, question 8)
		expect(params).not.toHaveProperty('payment_method_types');
		expect(params.line_items).toEqual([
			{
				quantity: 1,
				price_data: {
					currency: 'usd',
					unit_amount: 50000,
					product_data: { name: 'Weekday classes' }
				}
			}
		]);
		expect(opts).toEqual({ idempotencyKey: 'checkout:o1' });
	});

	it('uses the Stripe price id when the product has one', async () => {
		const { stripe, calls } = fakeStripe();
		await stripeGateway(stripe).createCheckout({
			...req,
			lineItems: [{ ...req.lineItems[0], stripePriceId: 'price_abc' }]
		});
		expect(calls[0].params.line_items).toEqual([{ price: 'price_abc', quantity: 1 }]);
	});

	it('a session without a url is a failure, not a throw', async () => {
		const { stripe } = fakeStripe({ url: null });
		const out = await stripeGateway(stripe).createCheckout(req);
		expect(out.ok).toBe(false);
		if (!out.ok) expect(out.error.code).toBe('unexpected');
	});

	it('an SDK error becomes a Result carrying the message, never a throw', async () => {
		const { stripe } = fakeStripe({ throwOn: 'session' });
		const out = await stripeGateway(stripe).createCheckout(req);
		expect(out.ok).toBe(false);
		if (!out.ok) {
			expect(out.error.code).toBe('unexpected');
			expect(out.error.detail).toBe('rate_limit');
		}
	});

	it('refunds by payment intent with the amount and the order id, idempotent per order', async () => {
		const { stripe, calls } = fakeStripe();
		const out = await stripeGateway(stripe).refund({
			orderId: 'o1',
			paymentIntentId: 'pi_1',
			amountCents: 50000
		});
		expect(out).toEqual({ ok: true, value: { refundId: 're_123' } });
		expect(calls[0].method).toBe('refunds.create');
		expect(calls[0].params).toEqual({
			payment_intent: 'pi_1',
			amount: 50000,
			metadata: { order_id: 'o1' }
		});
		expect(calls[0].opts).toEqual({ idempotencyKey: 'refund:o1' });
	});

	it('a refund failure is a Result too', async () => {
		const { stripe } = fakeStripe({ throwOn: 'refund' });
		const out = await stripeGateway(stripe).refund({
			orderId: 'o1',
			paymentIntentId: 'pi_1',
			amountCents: 50000
		});
		expect(out.ok).toBe(false);
		if (!out.ok) expect(out.error.detail).toBe('charge_already_refunded');
	});
});
