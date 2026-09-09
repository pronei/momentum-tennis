import { error, fail } from '@sveltejs/kit';
import { getConfig } from '$lib/server/config.runtime';
import { createAdminSupabase } from '$lib/server/db/admin';
import { CREDIT_LABELS } from '$lib/server/domain/booking/credits';
import { selectGateway } from '$lib/server/domain/payments/gateway.runtime';
import { paymentHandlers } from '$lib/server/domain/payments/handlers';
import {
	cancelOrder,
	getOrder,
	ORDER_STATUS_LABELS,
	orderLots,
	refundable
} from '$lib/server/domain/payments/orders';
import { formatMoney } from '$lib/server/domain/payments/products';
import { fakeEvents } from '$lib/server/domain/payments/simulate';
import { supabaseEventStore } from '$lib/server/domain/payments/store';
import { handleStripeEvent } from '$lib/server/domain/payments/webhook';
import { describeError } from '$lib/server/domain/result';
import { getAcademySettings } from '$lib/server/domain/settings';
import { academyDate } from '$lib/server/domain/time';
import type { Actions, PageServerLoad } from './$types';

// One order, everything it touched. The refund policy is the database's (refund_order refuses a
// drawn-on pack); this page asks the same question first so it can say why the button is absent.

type LedgerRow = {
	id: string;
	entry_type: string;
	delta: number;
	reason: string | null;
	created_at: string;
};

export const load: PageServerLoad = async ({ params, locals }) => {
	const found = await getOrder(locals.supabase, params.id);
	if (!found.ok) error(500, describeError(found.error.code));
	if (!found.value) error(404, 'No such order');
	const o = found.value;

	const [settings, lots] = await Promise.all([
		getAcademySettings(locals.supabase),
		orderLots(locals.supabase, o.id)
	]);
	const tz = settings.timezone;
	const lotList = lots.ok ? lots.value : [];
	const nameOf = new Map(o.items.map((i) => [i.playerId, i.playerName]));

	// every ledger row the order's lots carry: the purchases themselves and everything drawn on them
	const ledger = lotList.length
		? await locals.supabase
				.from('credit_ledger')
				.select('id, entry_type, delta, reason, created_at')
				.in(
					'lot_id',
					lotList.map((l) => l.lotId)
				)
				.order('created_at')
		: { data: [] as LedgerRow[] };

	return {
		gateway: getConfig().paymentsGateway,
		order: {
			id: o.id,
			ref: o.id.slice(0, 8).toUpperCase(),
			status: o.status,
			statusLabel: ORDER_STATUS_LABELS[o.status],
			on: academyDate(o.paidAt ?? o.createdAt, tz),
			account: o.accountEmail ?? '—',
			total: formatMoney(o.amountCents, o.currency),
			paymentIntentId: o.paymentIntentId,
			checkoutSessionId: o.checkoutSessionId,
			items: o.items.map((i) => ({
				name: i.productName,
				player: i.playerName,
				amount: formatMoney(i.unitAmountCents * i.quantity, o.currency)
			}))
		},
		lots: lotList.map((l) => ({
			id: l.lotId,
			player: nameOf.get(l.playerId) ?? '—',
			kind: CREDIT_LABELS[l.creditKind],
			issued: l.issued,
			remaining: l.remaining,
			expires: l.expiresAt ? academyDate(l.expiresAt, tz) : 'NO EXPIRY'
		})),
		ledger: ((ledger.data ?? []) as unknown as LedgerRow[]).map((r) => ({
			id: r.id,
			on: academyDate(r.created_at, tz),
			entryType: r.entry_type.toUpperCase(),
			movement: r.delta > 0 ? `+${r.delta}` : String(r.delta),
			reason: r.reason ?? '—'
		})),
		refundable: o.status === 'paid' && refundable(lotList),
		notRefundable:
			o.status === 'paid' && !refundable(lotList) ? describeError('credits_already_used') : null,
		// what the button will actually do, so the page can say it plainly
		reverses: lotList.reduce((n, l) => n + l.remaining, 0)
	};
};

export const actions: Actions = {
	refund: async ({ params, locals }) => {
		const found = await getOrder(locals.supabase, params.id);
		if (!found.ok || !found.value) error(404, 'No such order');
		const o = found.value;
		if (o.status !== 'paid') return fail(400, { reason: describeError('order_not_paid') });

		const lots = await orderLots(locals.supabase, o.id);
		if (!lots.ok) return fail(400, { reason: describeError(lots.error.code) });
		if (!refundable(lots.value))
			return fail(400, { reason: describeError('credits_already_used') });
		if (!o.paymentIntentId)
			return fail(400, { reason: 'That order carries no payment reference to refund against.' });

		const gateway = selectGateway();
		const refunded = await gateway.refund({
			orderId: o.id,
			paymentIntentId: o.paymentIntentId,
			amountCents: o.amountCents
		});
		if (!refunded.ok) return fail(502, { reason: describeError(refunded.error.code) });

		// Stripe sends its own charge.refunded to the webhook; the simulated gateway sends nobody,
		// so the same event is raised here — through the service role, like every settlement.
		if (gateway.kind === 'fake') {
			const admin = createAdminSupabase();
			await handleStripeEvent(
				supabaseEventStore(admin),
				fakeEvents.refunded(o.id),
				paymentHandlers({ db: admin, onSettled: async () => {} })
			);
			return { message: 'REFUNDED · CREDITS REVERSED' };
		}
		return { message: 'REFUND REQUESTED · credits reverse when Stripe confirms' };
	},

	cancel: async ({ params, locals }) => {
		const cancelled = await cancelOrder(locals.supabase, params.id);
		if (!cancelled.ok) return fail(400, { reason: describeError(cancelled.error.code) });
		return { message: 'CANCELLED' };
	}
};
