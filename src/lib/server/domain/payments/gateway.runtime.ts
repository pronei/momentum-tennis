import Stripe from 'stripe';
import { getConfig, secretOr503 } from '$lib/server/config.runtime';
import { fakeGateway, stripeGateway, type PaymentGateway, type StripeLike } from './gateway';

/**
 * The gateway this environment runs. 'fake' is a dev convenience that pnpm env:check refuses for
 * production. The Stripe client is wrapped in two named calls rather than cast to the port's type:
 * TypeScript then checks the port's parameters against the real SDK.
 */
export function selectGateway(): PaymentGateway {
	const cfg = getConfig();
	if (cfg.paymentsGateway === 'fake') return fakeGateway(cfg.siteUrl);
	const stripe = new Stripe(secretOr503('STRIPE_SECRET_KEY', 'Stripe'), {
		httpClient: Stripe.createFetchHttpClient()
	});
	const client: StripeLike = {
		checkout: {
			sessions: { create: (params, opts) => stripe.checkout.sessions.create(params, opts) }
		},
		refunds: { create: (params, opts) => stripe.refunds.create(params, opts) }
	};
	return stripeGateway(client);
}
