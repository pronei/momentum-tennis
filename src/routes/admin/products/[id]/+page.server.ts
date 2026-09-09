import { error, fail } from '@sveltejs/kit';
import { message, setError, superValidate } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';
import { getProduct, productSchema, saveProduct } from '$lib/server/domain/payments/products';
import { describeError } from '$lib/server/domain/result';
import type { Actions, PageServerLoad } from './$types';

// Cents live in the database, dollars in the form. productSchema mirrors 0001's check constraints
// so the form can explain a refusal before the database has to make one.

const toDollars = (cents: number | null) => (cents === null ? undefined : cents / 100);

export const load: PageServerLoad = async ({ params, locals }) => {
	if (params.id === 'new')
		return {
			isNew: true,
			name: 'New product',
			form: await superValidate(
				{ kind: 'class_pack' as const, active: true },
				zod4(productSchema),
				{
					errors: false
				}
			)
		};

	const found = await getProduct(locals.supabase, params.id);
	if (!found.ok) error(500, describeError(found.error.code));
	if (!found.value) error(404, 'No such product');
	const p = found.value;

	return {
		isNew: false,
		name: p.name,
		form: await superValidate(
			{
				id: p.id,
				name: p.name,
				kind: p.kind,
				description: p.description ?? undefined,
				priceDollars: p.pricePublicCents / 100,
				memberPriceDollars: toDollars(p.priceMemberCents),
				creditKind: p.creditKind ?? undefined,
				creditQuantity: p.creditQuantity ?? undefined,
				validityDays: p.creditValidityDays ?? undefined,
				forgivenSkips: p.forgivenSkips ?? undefined,
				stripePricePublic: p.stripePricePublic ?? '',
				stripePriceMember: p.stripePriceMember ?? '',
				active: p.active
			},
			zod4(productSchema),
			{ errors: false }
		)
	};
};

export const actions: Actions = {
	save: async ({ request, locals }) => {
		const form = await superValidate(request, zod4(productSchema));
		if (!form.valid) return fail(400, { form });
		const saved = await saveProduct(locals.supabase, form.data);
		if (!saved.ok) return setError(form, '', describeError(saved.error.code), { status: 400 });
		// an insert hands back the new id: the next submit on this page updates rather than
		// creating a second product
		form.data.id = saved.value.id;
		return message(form, `SAVED · ${form.data.name.toUpperCase()}`);
	}
};
