import { fail, redirect } from '@sveltejs/kit';
import { setError, superValidate } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';
import { getConfig } from '$lib/server/config.runtime';
import { listPlayers } from '$lib/server/domain/identity/players';
import { buySchema, startCheckout } from '$lib/server/domain/payments/checkout';
import { selectGateway } from '$lib/server/domain/payments/gateway.runtime';
import { formatMoney, listProducts, packFacts } from '$lib/server/domain/payments/products';
import { describeError } from '$lib/server/domain/result';
import { getAcademySettings } from '$lib/server/domain/settings';
import type { Actions, PageServerLoad } from './$types';

// Public. Anyone reads the catalogue — RLS shows anon the active products — and only a signed-in
// guardian may start a checkout, because create_order asks who guards the player.

export const load: PageServerLoad = async ({ locals, url }) => {
	const [settings, catalogue] = await Promise.all([
		getAcademySettings(locals.supabase),
		listProducts(locals.supabase, { activeOnly: true })
	]);
	const products = catalogue.ok ? catalogue.value : [];
	const defaults = {
		validityDays: settings.defaultCreditValidityDays,
		forgivenSkips: settings.defaultForgivenSkips
	};

	const roster = locals.user ? await listPlayers(locals.supabase, locals.user.id) : null;
	// a guardian buys for any player they guard, adult or minor — the pack belongs to the player
	const players = roster?.ok ? roster.value : [];

	return {
		signedIn: Boolean(locals.user),
		cancelled: url.searchParams.has('cancelled'),
		products: products.map((p) => ({
			id: p.id,
			name: p.name,
			description: p.description,
			publicPrice: formatMoney(p.pricePublicCents, p.currency),
			memberPrice:
				p.priceMemberCents !== null && p.priceMemberCents !== p.pricePublicCents
					? formatMoney(p.priceMemberCents, p.currency)
					: null,
			facts: packFacts(p, defaults)
		})),
		players: players.map((p) => ({ value: p.id, label: p.fullName })),
		loadError: catalogue.ok ? null : describeError(catalogue.error.code),
		form: await superValidate({ productId: products[0]?.id }, zod4(buySchema), { errors: false })
	};
};

export const actions: Actions = {
	buy: async ({ request, locals }) => {
		if (!locals.user?.email) redirect(303, '/login?next=/store');
		const form = await superValidate(request, zod4(buySchema));
		if (!form.valid) return fail(400, { form });

		const cfg = getConfig();
		const started = await startCheckout(
			{
				db: locals.supabase,
				gateway: selectGateway(),
				siteUrl: cfg.siteUrl,
				email: locals.user.email
			},
			form.data
		);
		if (!started.ok) return setError(form, '', describeError(started.error.code), { status: 400 });
		// the gateway's page — its own on Stripe, ours on the simulated one
		redirect(303, started.value.url);
	}
};
