import {
	listOrders,
	ORDER_STATUS_LABELS,
	type OrderStatus
} from '$lib/server/domain/payments/orders';
import { formatMoney } from '$lib/server/domain/payments/products';
import { describeError } from '$lib/server/domain/result';
import { getAcademySettings } from '$lib/server/domain/settings';
import { academyDate } from '$lib/server/domain/time';
import type { PageServerLoad } from './$types';

// Every order, filtered by status through the URL — the console works with JavaScript off, so the
// filter is a GET form, not a listener.

const STATUSES = Object.keys(ORDER_STATUS_LABELS) as OrderStatus[];
const isStatus = (s: string): s is OrderStatus => (STATUSES as string[]).includes(s);

export const load: PageServerLoad = async ({ locals, url }) => {
	const requested = url.searchParams.get('status') ?? '';
	const status = isStatus(requested) ? requested : undefined;

	const [settings, orders] = await Promise.all([
		getAcademySettings(locals.supabase),
		listOrders(locals.supabase, { status })
	]);

	return {
		status: status ?? '',
		statuses: STATUSES.map((s) => ({ value: s, label: ORDER_STATUS_LABELS[s] })),
		rows: (orders.ok ? orders.value : []).map((o) => ({
			id: o.id,
			ref: o.id.slice(0, 8).toUpperCase(),
			on: academyDate(o.paidAt ?? o.createdAt, settings.timezone),
			account: o.accountEmail ?? '—',
			player: o.items.map((i) => i.playerName).join(' · ') || '—',
			item: o.items.map((i) => i.productName).join(' · ') || '—',
			amount: formatMoney(o.amountCents, o.currency),
			status: ORDER_STATUS_LABELS[o.status]
		})),
		loadError: orders.ok ? null : describeError(orders.error.code)
	};
};
