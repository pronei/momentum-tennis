import { describe, expect, it } from 'vitest';
import { AppError } from '../result';
import { called, fakeDb, type Reply } from '../schedule/fakes';
import { paymentHandlers, type HandlerDeps } from './handlers';
import type { StripeEventLike } from './webhook';

const evt = (type: string, object: unknown): StripeEventLike => ({
	id: `evt_${type}`,
	type,
	data: { object }
});
const session = (over: Record<string, unknown> = {}) => ({
	id: 'cs_1',
	client_reference_id: 'o1',
	payment_status: 'paid',
	payment_intent: 'pi_1',
	metadata: { order_id: 'o1' },
	...over
});

/** The handlers under test, plus the call log and the orders `onSettled` reported. */
function harness(opts: { rpc?: Reply; tables?: Record<string, Reply> } = {}) {
	const calls: unknown[] = [];
	const settled: string[] = [];
	const deps: HandlerDeps = {
		db: fakeDb({ calls, rpc: opts.rpc ?? { data: { status: 'paid', issued: 1 } }, ...opts }),
		onSettled: async (orderId) => void settled.push(orderId)
	};
	return { handlers: paymentHandlers(deps), calls, settled };
}

describe('paymentHandlers — every Stripe event becomes one of the 0009 RPCs, or nothing', () => {
	it('a paid checkout session settles the order with both Stripe references', async () => {
		const { handlers, calls, settled } = harness();
		await handlers['checkout.session.completed'](evt('checkout.session.completed', session()));
		expect(
			called(calls, 'rpc', 'settle_order', {
				p_order: 'o1',
				p_payment_intent: 'pi_1',
				p_checkout_session: 'cs_1'
			})
		).toBe(true);
		expect(settled).toEqual(['o1']);
	});

	it('a replay issues nothing, so no second receipt goes out', async () => {
		const { handlers, settled } = harness({ rpc: { data: { status: 'paid', issued: 0 } } });
		await handlers['checkout.session.completed'](evt('checkout.session.completed', session()));
		expect(settled).toEqual([]);
	});

	it('an unpaid session (ACH pending) settles nothing and attaches the references instead', async () => {
		const { handlers, calls, settled } = harness();
		await handlers['checkout.session.completed'](
			evt('checkout.session.completed', session({ payment_status: 'unpaid' }))
		);
		expect(called(calls, 'rpc', 'settle_order')).toBe(false);
		expect(called(calls, 'from', 'orders')).toBe(true);
		expect(
			called(calls, 'update', {
				stripe_checkout_session_id: 'cs_1',
				stripe_payment_intent_id: 'pi_1'
			})
		).toBe(true);
		expect(called(calls, 'eq', 'id', 'o1')).toBe(true);
		expect(settled).toEqual([]);
	});

	it('the async success that follows an ACH debit settles it', async () => {
		const { handlers, calls, settled } = harness();
		await handlers['checkout.session.async_payment_succeeded'](
			evt('checkout.session.async_payment_succeeded', session({ payment_status: 'paid' }))
		);
		expect(
			called(calls, 'rpc', 'settle_order', {
				p_order: 'o1',
				p_payment_intent: 'pi_1',
				p_checkout_session: 'cs_1'
			})
		).toBe(true);
		expect(settled).toEqual(['o1']);
	});

	it('a succeeded PaymentIntent settles from its own metadata and id — it may arrive first', async () => {
		const { handlers, calls, settled } = harness();
		await handlers['payment_intent.succeeded'](
			evt('payment_intent.succeeded', { id: 'pi_9', metadata: { order_id: 'o9' } })
		);
		expect(called(calls, 'rpc', 'settle_order', { p_order: 'o9', p_payment_intent: 'pi_9' })).toBe(
			true
		);
		expect(settled).toEqual(['o9']);
	});

	it('an expired session and a failed async payment cancel the pending order', async () => {
		for (const type of ['checkout.session.expired', 'checkout.session.async_payment_failed']) {
			const { handlers, calls } = harness({ rpc: { data: null } });
			await handlers[type](evt(type, session()));
			expect(called(calls, 'rpc', 'cancel_order', { p_order: 'o1' })).toBe(true);
		}
	});

	it('an order already paid by the other path refuses the cancel, and that is not a fault', async () => {
		const { handlers } = harness({ rpc: { error: { message: 'order_not_pending' } } });
		await expect(
			handlers['checkout.session.expired'](evt('checkout.session.expired', session()))
		).resolves.toBeUndefined();
	});

	it('a full refund in Stripe reverses the credits', async () => {
		const { handlers, calls } = harness({ rpc: { data: { status: 'refunded', reversed: 1 } } });
		await handlers['charge.refunded'](
			evt('charge.refunded', {
				id: 'ch_1',
				refunded: true,
				payment_intent: 'pi_1',
				metadata: { order_id: 'o1' }
			})
		);
		expect(
			called(calls, 'rpc', 'refund_order', { p_order: 'o1', p_reason: 'refunded in Stripe' })
		).toBe(true);
	});

	it('a charge without metadata finds its order by the payment intent', async () => {
		const { handlers, calls } = harness({
			rpc: { data: { status: 'refunded', reversed: 1 } },
			tables: { orders: { data: { id: 'o7' } } }
		});
		await handlers['charge.refunded'](
			evt('charge.refunded', { id: 'ch_2', refunded: true, payment_intent: 'pi_7' })
		);
		expect(called(calls, 'eq', 'stripe_payment_intent_id', 'pi_7')).toBe(true);
		expect(
			called(calls, 'rpc', 'refund_order', { p_order: 'o7', p_reason: 'refunded in Stripe' })
		).toBe(true);
	});

	it('a partial refund is skipped: this phase reverses whole packs only', async () => {
		const { handlers, calls } = harness();
		const out = await handlers['charge.refunded'](
			evt('charge.refunded', {
				id: 'ch_3',
				refunded: false,
				payment_intent: 'pi_1',
				metadata: { order_id: 'o1' }
			})
		);
		expect(out).toBe('skipped');
		expect(called(calls, 'rpc', 'refund_order')).toBe(false);
	});

	it('an event with no order is skipped — the interim Payment Links share this Stripe account', async () => {
		const { handlers, calls } = harness({ tables: { orders: { data: null } } });
		for (const [type, object] of [
			['checkout.session.completed', { id: 'cs_x', payment_status: 'paid' }],
			['checkout.session.expired', { id: 'cs_x' }],
			['payment_intent.succeeded', { id: 'pi_x' }],
			['charge.refunded', { id: 'ch_x', refunded: true }]
		] as const)
			expect(await handlers[type](evt(type, object))).toBe('skipped');
		expect(called(calls, 'rpc', 'settle_order')).toBe(false);
		expect(called(calls, 'rpc', 'cancel_order')).toBe(false);
		expect(called(calls, 'rpc', 'refund_order')).toBe(false);
	});

	it('a settlement the database refuses is thrown, so it is recorded as an error and retried', async () => {
		const { handlers } = harness({ rpc: { error: { message: 'unknown_order' } } });
		await expect(
			handlers['checkout.session.completed'](evt('checkout.session.completed', session()))
		).rejects.toThrow(AppError);
		await expect(
			handlers['checkout.session.completed'](evt('checkout.session.completed', session()))
		).rejects.toThrow('unknown_order');
	});
});
