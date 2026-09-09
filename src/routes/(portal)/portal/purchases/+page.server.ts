import { listOrders, ORDER_STATUS_LABELS } from '$lib/server/domain/payments/orders';
import { formatMoney } from '$lib/server/domain/payments/products';
import { describeError } from '$lib/server/domain/result';
import { getAcademySettings } from '$lib/server/domain/settings';
import { academyDate } from '$lib/server/domain/time';
import type { PageServerLoad } from './$types';

// What this account has bought. No filter is passed: RLS scopes orders to the account, so the
// list is already the family's and nothing here has to remember to say so.

export const load: PageServerLoad = async ({ locals, url }) => {
	const [settings, orders] = await Promise.all([
		getAcademySettings(locals.supabase),
		listOrders(locals.supabase, {})
	]);

	return {
		paid: url.searchParams.has('paid'),
		rows: (orders.ok ? orders.value : []).map((o) => ({
			id: o.id,
			ref: o.id.slice(0, 8).toUpperCase(),
			on: academyDate(o.paidAt ?? o.createdAt, settings.timezone),
			item: o.items.map((i) => i.productName).join(' · ') || '—',
			player: o.items.map((i) => i.playerName).join(' · ') || '—',
			amount: formatMoney(o.amountCents, o.currency),
			status: ORDER_STATUS_LABELS[o.status]
		})),
		loadError: orders.ok ? null : describeError(orders.error.code)
	};
};
