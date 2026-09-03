import { fail, redirect } from '@sveltejs/kit';
import { setError, superValidate } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';
import {
	createPlayer,
	listSkillLevels,
	newPlayerSchema
} from '$lib/server/domain/identity/players';
import { describeError } from '$lib/server/domain/result';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	const levels = await listSkillLevels(locals.supabase);
	return {
		form: await superValidate(zod4(newPlayerSchema)),
		// an unreadable level list must not block adding a player — the academy can set it later
		levels: levels.ok ? levels.value : []
	};
};

export const actions: Actions = {
	default: async ({ request, locals }) => {
		const form = await superValidate(request, zod4(newPlayerSchema));
		if (!form.valid) return fail(400, { form });
		const result = await createPlayer(locals.supabase, form.data);
		if (!result.ok) return setError(form, '', describeError(result.error.code), { status: 400 });
		redirect(303, `/portal/players?player=${result.value.playerId}`);
	}
};
