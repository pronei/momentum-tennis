// Money moves behind this line; credits never do. The gateway is a port so the store, the
// simulated checkout and the admin refund are written once against it, and the environment
// decides which adapter runs (config: PAYMENTS_GATEWAY).
import { AppError, err, ok, type Result } from '../result';

export type LineItem = {
	name: string;
	unitAmountCents: number;
	quantity: number;
	/** A Stripe price id from the catalogue; null sends the amount inline */
	stripePriceId: string | null;
};
export type CheckoutRequest = {
	orderId: string;
	customerEmail: string;
	currency: string;
	lineItems: LineItem[];
	successUrl: string;
	cancelUrl: string;
};
export type CheckoutSession = { id: string; url: string };
export type RefundRequest = { orderId: string; paymentIntentId: string; amountCents: number };

export interface PaymentGateway {
	readonly kind: 'stripe' | 'fake';
	createCheckout(req: CheckoutRequest): Promise<Result<CheckoutSession>>;
	refund(req: RefundRequest): Promise<Result<{ refundId: string }>>;
}

// The exact parameters the adapter sends — a subset of Stripe's, narrow enough that a fake in a
// test and the real SDK both satisfy the same type without a cast.
export type SessionCreateLike = {
	mode: 'payment';
	client_reference_id: string;
	customer_email: string;
	metadata: Record<string, string>;
	payment_intent_data: { metadata: Record<string, string> };
	line_items: (
		| { price: string; quantity: number }
		| {
				quantity: number;
				price_data: { currency: string; unit_amount: number; product_data: { name: string } };
		  }
	)[];
	success_url: string;
	cancel_url: string;
};
export type RefundCreateLike = {
	payment_intent: string;
	amount: number;
	metadata: Record<string, string>;
};
export type RequestOptionsLike = { idempotencyKey?: string };

/** The slice of the Stripe SDK the adapter touches — tests hand in a fake of exactly this. */
export type StripeLike = {
	checkout: {
		sessions: {
			create(
				params: SessionCreateLike,
				opts?: RequestOptionsLike
			): Promise<{ id: string; url: string | null }>;
		};
	};
	refunds: {
		create(params: RefundCreateLike, opts?: RequestOptionsLike): Promise<{ id: string }>;
	};
};

const failure = (e: unknown) =>
	err(new AppError('unexpected', e instanceof Error ? e.message : String(e)));

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
						// no payment_method_types: the dashboard decides what is offered until ACH is activated
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
					{
						payment_intent: req.paymentIntentId,
						amount: req.amountCents,
						metadata: { order_id: req.orderId }
					},
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
