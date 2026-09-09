import { CREDIT_LABELS } from '$lib/server/domain/booking/credits';
import {
	formatMoney,
	listProducts,
	PRODUCT_KIND_LABELS
} from '$lib/server/domain/payments/products';
import { describeError } from '$lib/server/domain/result';
import type { PageServerLoad } from './$types';

// The catalogue as Artur edits it. Every product, active or not — a retired pack still has to be
// findable, because orders point at it.

export const load: PageServerLoad = async ({ locals }) => {
	const catalogue = await listProducts(locals.supabase, {});
	return {
		rows: (catalogue.ok ? catalogue.value : []).map((p) => ({
			id: p.id,
			name: p.name,
			kind: PRODUCT_KIND_LABELS[p.kind],
			price: formatMoney(p.pricePublicCents, p.currency),
			credits: p.creditKind ? `${p.creditQuantity ?? 0} ${CREDIT_LABELS[p.creditKind]}` : '—',
			validity: p.creditValidityDays ? `${p.creditValidityDays} DAYS` : 'ACADEMY DEFAULT',
			active: p.active ? 'ACTIVE' : 'EXPIRED',
			stripe: p.stripePricePublic ? 'SET' : '—'
		})),
		loadError: catalogue.ok ? null : describeError(catalogue.error.code)
	};
};
