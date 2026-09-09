import { error } from '@sveltejs/kit';
import { CREDIT_LABELS } from '$lib/server/domain/booking/credits';
import { getOrder, ORDER_STATUS_LABELS, orderLots } from '$lib/server/domain/payments/orders';
import { formatMoney } from '$lib/server/domain/payments/products';
import { getAcademySettings } from '$lib/server/domain/settings';
import { academyDate } from '$lib/server/domain/time';
import type { PageServerLoad } from './$types';

// The receipt a family keeps: the same facts the emailed one carries, plus what is left of each
// lot. RLS decides whose order this is — an id from another family is simply not found.

export const load: PageServerLoad = async ({ params, locals }) => {
	const order = await getOrder(locals.supabase, params.id);
	if (!order.ok || !order.value) error(404, 'Not found');
	const o = order.value;

	const [settings, lots] = await Promise.all([
		getAcademySettings(locals.supabase),
		orderLots(locals.supabase, o.id)
	]);
	const tz = settings.timezone;
	const nameOf = new Map(o.items.map((i) => [i.playerId, i.playerName]));

	return {
		order: {
			id: o.id,
			ref: o.id.slice(0, 8).toUpperCase(),
			statusLabel: ORDER_STATUS_LABELS[o.status],
			on: academyDate(o.paidAt ?? o.createdAt, tz),
			total: formatMoney(o.amountCents, o.currency),
			stripeRef: o.paymentIntentId ? o.paymentIntentId.toUpperCase() : null,
			items: o.items.map((i) => ({
				name: i.productName,
				player: i.playerName,
				amount: formatMoney(i.unitAmountCents * i.quantity, o.currency)
			}))
		},
		lots: (lots.ok ? lots.value : []).map((l) => ({
			id: l.lotId,
			player: nameOf.get(l.playerId) ?? '—',
			kind: CREDIT_LABELS[l.creditKind],
			issued: l.issued,
			remaining: l.remaining,
			expires: l.expiresAt ? academyDate(l.expiresAt, tz) : 'NO EXPIRY'
		}))
	};
};
