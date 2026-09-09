import { describe, expect, it } from 'vitest';
import { fakeEvents } from './simulate';

const object = <T>(e: { data: { object: unknown } }) => e.data.object as T;
type Session = {
	id: string;
	client_reference_id: string;
	payment_status: string;
	payment_intent: string;
	metadata: Record<string, string>;
};
type Charge = { payment_intent: string; refunded: boolean; metadata: Record<string, string> };

describe('fakeEvents — Stripe-shaped events the simulated gateway feeds to the real handlers', () => {
	it('paid: a completed, paid checkout session carrying the order', () => {
		const e = fakeEvents.paid('o1');
		expect(e.type).toBe('checkout.session.completed');
		expect(e.id.startsWith('evt_fake_')).toBe(true);
		expect(object<Session>(e)).toMatchObject({
			id: 'cs_fake_o1',
			client_reference_id: 'o1',
			payment_status: 'paid',
			payment_intent: 'pi_fake_o1',
			metadata: { order_id: 'o1' }
		});
	});

	it('every event has its own id, so a second one is never claimed as a duplicate', () => {
		expect(fakeEvents.paid('o1').id).not.toBe(fakeEvents.paid('o1').id);
	});

	it('expired: the same session, abandoned', () => {
		const e = fakeEvents.expired('o1');
		expect(e.type).toBe('checkout.session.expired');
		expect(object<Session>(e)).toMatchObject({
			id: 'cs_fake_o1',
			client_reference_id: 'o1',
			payment_intent: 'pi_fake_o1',
			metadata: { order_id: 'o1' }
		});
	});

	it('refunded: a fully refunded charge on the order it belongs to', () => {
		const e = fakeEvents.refunded('o1');
		expect(e.type).toBe('charge.refunded');
		expect(object<Charge>(e)).toMatchObject({
			refunded: true,
			payment_intent: 'pi_fake_o1',
			metadata: { order_id: 'o1' }
		});
	});
});
