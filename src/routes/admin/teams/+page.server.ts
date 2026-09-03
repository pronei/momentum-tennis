import { fail } from '@sveltejs/kit';
import { message, setError, superValidate } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';
import { describeError } from '$lib/server/domain/result';
import { createTeam, listTeams, teamSchema } from '$lib/server/domain/schedule/teams';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	const teams = await listTeams(locals.supabase);
	return {
		teams: teams.ok ? teams.value : [],
		loadError: teams.ok ? null : describeError(teams.error.code),
		form: await superValidate(zod4(teamSchema))
	};
};

export const actions: Actions = {
	default: async ({ request, locals }) => {
		const form = await superValidate(request, zod4(teamSchema));
		if (!form.valid) return fail(400, { form });
		const result = await createTeam(locals.supabase, form.data);
		if (!result.ok)
			return setError(
				form,
				'name',
				result.error.code === 'conflict'
					? 'That team already exists for this season.'
					: describeError(result.error.code),
				{ status: 400 }
			);
		return message(form, `ADDED · ${form.data.name.toUpperCase()}`);
	}
};
