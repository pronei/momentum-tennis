import { fromPostgres } from '../result';
import type { PaymentsDb } from './products';
import type { StripeEventLike, StripeHandlers } from './webhook';

// Stripe's vocabulary on one side, the 0009 RPCs on the other, and nothing in between: no price
// is re-derived here, no credit is written here. A handler either names an RPC, attaches a
// reference, or answers 'skipped'. Throwing means "this is a fault, retry it" — reserved for a
// database that refuses something that should have been possible.

export type HandlerDeps = {
	/** service-role client: there is no user in a webhook, and settle/refund refuse a non-admin */
	db: PaymentsDb;
	/** runs once per order, when settlement actually issued credits */
	onSettled: (orderId: string) => Promise<void>;
};

type SessionLike = {
	id: string;
	client_reference_id?: string | null;
	payment_status?: string;
	payment_intent?: string | null;
	metadata?: Record<string, string> | null;
};
type IntentLike = { id: string; metadata?: Record<string, string> | null };
type ChargeLike = {
	id: string;
	refunded?: boolean;
	payment_intent?: string | null;
	metadata?: Record<string, string> | null;
};

/** Stripe carries the order in metadata; a Checkout Session also carries it as the client ref. */
export const orderIdOf = (o: {
	metadata?: Record<string, string> | null;
	client_reference_id?: string | null;
}) => o.metadata?.order_id ?? o.client_reference_id ?? null;

const objectOf = <T>(event: StripeEventLike) => event.data.object as T;

export function paymentHandlers(deps: HandlerDeps): StripeHandlers {
	async function settle(
		orderId: string,
		refs: { paymentIntent?: string | null; checkoutSession?: string | null }
	) {
		// Absent references are omitted, not nulled: settle_order coalesces onto what the order
		// already holds, so an event that knows only the intent cannot erase the session id.
		const args: { p_order: string; p_payment_intent?: string; p_checkout_session?: string } = {
			p_order: orderId
		};
		if (refs.paymentIntent) args.p_payment_intent = refs.paymentIntent;
		if (refs.checkoutSession) args.p_checkout_session = refs.checkoutSession;
		const { data, error } = await deps.db.rpc('settle_order', args);
		if (error) throw fromPostgres(error);
		// issued counts the lots this call created; a replay creates none and sends no receipt
		if (((data as { issued?: number } | null)?.issued ?? 0) > 0) await deps.onSettled(orderId);
	}

	const settleSession: StripeHandlers[string] = async (event) => {
		const s = objectOf<SessionLike>(event);
		const orderId = orderIdOf(s);
		if (!orderId) return 'skipped';
		if (s.payment_status !== 'paid') {
			// ACH is pending: no money has moved. Attach the references so the async event, which
			// may carry the intent alone, still finds the order.
			const patch: { stripe_checkout_session_id: string; stripe_payment_intent_id?: string } = {
				stripe_checkout_session_id: s.id
			};
			if (s.payment_intent) patch.stripe_payment_intent_id = s.payment_intent;
			const { error } = await deps.db.from('orders').update(patch).eq('id', orderId);
			if (error) throw fromPostgres(error);
			return;
		}
		await settle(orderId, { paymentIntent: s.payment_intent, checkoutSession: s.id });
	};

	const cancelSession: StripeHandlers[string] = async (event) => {
		const orderId = orderIdOf(objectOf<SessionLike>(event));
		if (!orderId) return 'skipped';
		const { error } = await deps.db.rpc('cancel_order', { p_order: orderId });
		if (!error) return;
		// The paid path may have won the race; an order that is no longer pending needs no cancel.
		const mapped = fromPostgres(error);
		if (mapped.code !== 'order_not_pending') throw mapped;
	};

	return {
		'checkout.session.completed': settleSession,
		'checkout.session.async_payment_succeeded': settleSession,
		'checkout.session.expired': cancelSession,
		'checkout.session.async_payment_failed': cancelSession,

		'payment_intent.succeeded': async (event) => {
			const pi = objectOf<IntentLike>(event);
			const orderId = orderIdOf(pi);
			if (!orderId) return 'skipped';
			await settle(orderId, { paymentIntent: pi.id });
		},

		'charge.refunded': async (event) => {
			const charge = objectOf<ChargeLike>(event);
			// Partial refunds are outside this phase's policy (packs reverse whole, or not at all).
			if (!charge.refunded) return 'skipped';
			let orderId = orderIdOf(charge);
			if (!orderId && charge.payment_intent) {
				const { data, error } = await deps.db
					.from('orders')
					.select('id')
					.eq('stripe_payment_intent_id', charge.payment_intent)
					.maybeSingle();
				if (error) throw fromPostgres(error);
				orderId = (data as { id: string } | null)?.id ?? null;
			}
			if (!orderId) return 'skipped';
			const { error } = await deps.db.rpc('refund_order', {
				p_order: orderId,
				p_reason: 'refunded in Stripe'
			});
			if (error) throw fromPostgres(error);
		}
	};
}
