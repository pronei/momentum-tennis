import { error, json } from '@sveltejs/kit';
import Stripe from 'stripe';
import { getConfig, secretOr503 } from '$lib/server/config.runtime';
import { createAdminSupabase } from '$lib/server/db/admin';
import { paymentHandlers } from '$lib/server/domain/payments/handlers';
import { sendReceipt } from '$lib/server/domain/payments/receipt';
import { supabaseEventStore } from '$lib/server/domain/payments/store';
import { handleStripeEvent } from '$lib/server/domain/payments/webhook';
import type { RequestHandler } from './$types';

/**
 * Stripe → us. Raw body + signature verification (async variant: Workers have no sync crypto),
 * then insert-first idempotency on the event id, then the handlers that turn an event into one of
 * the 0009 order RPCs. The service-role client is the one that settles: settle_order and
 * refund_order refuse a non-admin caller, and that refusal is the guarantee. Until the Stripe
 * secrets are set for an environment this endpoint answers 503.
 */
export const POST: RequestHandler = async ({ request }) => {
	const secretKey = secretOr503('STRIPE_SECRET_KEY', 'Stripe');
	const webhookSecret = secretOr503('STRIPE_WEBHOOK_SECRET', 'Stripe');
	const signature = request.headers.get('stripe-signature');
	if (!signature) error(400, 'Missing signature');
	const payload = await request.text();

	const stripe = new Stripe(secretKey, { httpClient: Stripe.createFetchHttpClient() });
	let event: Stripe.Event;
	try {
		event = await stripe.webhooks.constructEventAsync(
			payload,
			signature,
			webhookSecret,
			undefined,
			Stripe.createSubtleCryptoProvider()
		);
	} catch {
		error(400, 'Bad signature');
	}

	const admin = createAdminSupabase();
	const handlers = paymentHandlers({
		db: admin,
		// only when settlement actually issued credits — a replay must not send a second receipt
		onSettled: (orderId) => sendReceipt(admin, getConfig(), orderId).then(() => undefined)
	});
	const status = await handleStripeEvent(supabaseEventStore(admin), event, handlers);
	return json({ received: true, status });
};
