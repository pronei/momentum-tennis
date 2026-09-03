import { error, json } from '@sveltejs/kit';
import Stripe from 'stripe';
import { secretOr503 } from '$lib/server/config.runtime';
import { createAdminSupabase } from '$lib/server/db/admin';
import { supabaseEventStore } from '$lib/server/domain/payments/store';
import { handleStripeEvent, type StripeHandlers } from '$lib/server/domain/payments/webhook';
import type { RequestHandler } from './$types';

/**
 * Stripe → us. Raw body + signature verification (async variant: Workers have no sync crypto),
 * then insert-first idempotency on the event id. Handlers are registered in phase 5 — until then
 * every event is recorded and skipped, which is the honest state. Until the Stripe secrets are
 * set for an environment this endpoint answers 503.
 */
const handlers: StripeHandlers = {};

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

	const status = await handleStripeEvent(
		supabaseEventStore(createAdminSupabase()),
		event,
		handlers
	);
	return json({ received: true, status });
};
