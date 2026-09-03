import { error, fail } from '@sveltejs/kit';
import { setError, superValidate } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';
import { describeError } from '$lib/server/domain/result';
import { getVersion, signSchema, signWaiver } from '$lib/server/domain/waivers';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, locals, parent }) => {
	const { currentPlayer, waiverStatus } = await parent();
	if (!currentPlayer) error(400, 'Add a player before signing');

	const version = await getVersion(locals.supabase, params.versionId);
	if (!version.ok) error(500, describeError(version.error.code));
	if (!version.value || version.value.publishedAt === null) error(404, 'No such waiver version');

	return {
		version: version.value,
		player: currentPlayer,
		alreadySigned: waiverStatus.some((s) => s.versionId === params.versionId && s.satisfied),
		form: await superValidate(zod4(signSchema))
	};
};

export const actions: Actions = {
	default: async ({ request, params, url, locals, getClientAddress }) => {
		const form = await superValidate(request, zod4(signSchema));
		if (!form.valid) return fail(400, { form });

		// The player comes from the URL; sign_waiver is what decides whether this account may
		// act for them, and in what capacity. We never assert the capacity ourselves.
		const playerId = url.searchParams.get('player');
		if (!playerId) return setError(form, '', describeError('validation'), { status: 400 });

		const result = await signWaiver(locals.supabase, {
			versionId: params.versionId,
			playerId,
			typedName: form.data.typedName,
			ip: getClientAddress(),
			userAgent: request.headers.get('user-agent')
		});
		if (!result.ok) return setError(form, '', describeError(result.error.code), { status: 400 });
		// Re-rendering shows the receipt: the load recomputes status from the database.
		return { form };
	}
};
