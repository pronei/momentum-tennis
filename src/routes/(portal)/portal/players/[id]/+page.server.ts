import { error, fail, redirect } from '@sveltejs/kit';
import { message, setError, superValidate } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';
import { archivePlayer, editPlayerSchema, updatePlayer } from '$lib/server/domain/identity/players';
import { describeError } from '$lib/server/domain/result';
import { getAcademyTimezone } from '$lib/server/domain/settings';
import { academyTime } from '$lib/server/domain/time';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, parent }) => {
	// The layout already loaded exactly the players this account guards; anything else is a 404.
	const { players } = await parent();
	const player = players.find((p) => p.id === params.id);
	if (!player) error(404, 'No such player');
	return {
		player,
		form: await superValidate(
			{ fullName: player.fullName, birthdate: player.birthdate },
			zod4(editPlayerSchema)
		)
	};
};

export const actions: Actions = {
	default: async ({ request, params, locals }) => {
		const form = await superValidate(request, zod4(editPlayerSchema));
		if (!form.valid) return fail(400, { form });
		const result = await updatePlayer(locals.supabase, params.id, form.data);
		if (!result.ok) return setError(form, '', describeError(result.error.code), { status: 400 });
		const tz = await getAcademyTimezone(locals.supabase);
		return message(form, `SAVED · ${academyTime(new Date(), tz)}`);
	},

	archive: async ({ params, locals }) => {
		const result = await archivePlayer(locals.supabase, params.id);
		if (!result.ok) return fail(400, { archiveError: describeError(result.error.code) });
		redirect(303, '/portal/players');
	}
};
