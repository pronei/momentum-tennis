import type { StripeEventLike } from './webhook';

// The simulated gateway has no Stripe to call back, so the checkout page and the admin refund
// raise these themselves and run them through the very same handlers the webhook uses. Shaped
// like Stripe's payloads on purpose: dev exercises the production path, not a shortcut past it.
// Every event carries a fresh id — stripe_events claims ids, and a reused one would be dropped
// as a redelivery.

const session = (orderId: string, paymentStatus: string) => ({
	id: `cs_fake_${orderId}`,
	client_reference_id: orderId,
	payment_status: paymentStatus,
	payment_intent: `pi_fake_${orderId}`,
	metadata: { order_id: orderId }
});

const event = (type: string, object: unknown): StripeEventLike => ({
	id: `evt_fake_${crypto.randomUUID()}`,
	type,
	data: { object }
});

export const fakeEvents = {
	paid: (orderId: string) => event('checkout.session.completed', session(orderId, 'paid')),
	expired: (orderId: string) => event('checkout.session.expired', session(orderId, 'unpaid')),
	refunded: (orderId: string) =>
		event('charge.refunded', {
			id: `ch_fake_${orderId}`,
			refunded: true,
			payment_intent: `pi_fake_${orderId}`,
			metadata: { order_id: orderId }
		})
};
