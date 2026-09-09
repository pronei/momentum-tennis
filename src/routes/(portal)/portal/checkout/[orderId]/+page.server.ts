import { error, fail, redirect } from '@sveltejs/kit';
import { getConfig } from '$lib/server/config.runtime';
import { createAdminSupabase } from '$lib/server/db/admin';
import { paymentHandlers } from '$lib/server/domain/payments/handlers';
import { getOrder, ORDER_STATUS_LABELS } from '$lib/server/domain/payments/orders';
import { formatMoney } from '$lib/server/domain/payments/products';
import { sendReceipt } from '$lib/server/domain/payments/receipt';
import { fakeEvents } from '$lib/server/domain/payments/simulate';
import { supabaseEventStore } from '$lib/server/domain/payments/store';
import { handleStripeEvent } from '$lib/server/domain/payments/webhook';
import { describeError } from '$lib/server/domain/result';
import type { Actions, PageServerLoad } from './$types';

/**
 * The simulated gateway's "hosted page". It exists only where PAYMENTS_GATEWAY=fake, which
 * `pnpm env:check` forbids for production; on a Stripe environment this route is a 404.
 *
 * The order is read under the USER's RLS — a family may only pay for its own — but the events
 * run through the SERVICE-ROLE client, because settle_order refuses a non-admin caller. That
 * refusal is the guarantee that no client can settle its own order; the simulation must not
 * become a hole in it.
 */
const simulatedOnly = () => {
	if (getConfig().paymentsGateway !== 'fake') error(404, 'Not found');
};

export const load: PageServerLoad = async ({ params, locals }) => {
	simulatedOnly();
	const order = await getOrder(locals.supabase, params.orderId);
	if (!order.ok || !order.value) error(404, 'Not found');
	const o = order.value;
	return {
		order: {
			id: o.id,
			ref: o.id.slice(0, 8).toUpperCase(),
			status: o.status,
			statusLabel: ORDER_STATUS_LABELS[o.status],
			amount: formatMoney(o.amountCents, o.currency),
			items: o.items.map((i) => ({ name: i.productName, player: i.playerName }))
		},
		pending: o.status === 'pending'
	};
};

/** Both buttons do the same thing: raise the event Stripe would have sent, and let it settle. */
async function simulate(locals: App.Locals, orderId: string, kind: 'paid' | 'expired') {
	// re-read under the USER's client: ownership and pending-ness are checked against what this
	// account may actually see, not against what the form claimed
	const order = await getOrder(locals.supabase, orderId);
	if (!order.ok || !order.value || order.value.status !== 'pending')
		return fail(400, { reason: describeError('order_not_pending') });

	let admin: ReturnType<typeof createAdminSupabase>;
	try {
		admin = createAdminSupabase();
	} catch {
		// the service role is what settles; without its key the simulation cannot be honest
		error(503, 'Simulated checkout is not configured for this environment');
	}
	await handleStripeEvent(
		supabaseEventStore(admin),
		kind === 'paid' ? fakeEvents.paid(orderId) : fakeEvents.expired(orderId),
		paymentHandlers({
			db: admin,
			onSettled: (id) => sendReceipt(admin, getConfig(), id).then(() => undefined)
		})
	);
	return null;
}

export const actions: Actions = {
	pay: async ({ params, locals }) => {
		simulatedOnly();
		const failure = await simulate(locals, params.orderId, 'paid');
		if (failure) return failure;
		redirect(303, `/portal/purchases?paid=${params.orderId}`);
	},
	abandon: async ({ params, locals }) => {
		simulatedOnly();
		const failure = await simulate(locals, params.orderId, 'expired');
		if (failure) return failure;
		redirect(303, `/store?cancelled=${params.orderId}`);
	}
};
