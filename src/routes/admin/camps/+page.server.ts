import { fail } from '@sveltejs/kit';
import { message, setError, superValidate } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';
import { describeError } from '$lib/server/domain/result';
import { campSchema, createCamp, listCamps } from '$lib/server/domain/schedule/camps';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	const camps = await listCamps(locals.supabase);
	return {
		camps: camps.ok ? camps.value : [],
		loadError: camps.ok ? null : describeError(camps.error.code),
		form: await superValidate(zod4(campSchema))
	};
};

export const actions: Actions = {
	default: async ({ request, locals }) => {
		const form = await superValidate(request, zod4(campSchema));
		if (!form.valid) return fail(400, { form });
		const result = await createCamp(locals.supabase, form.data);
		// the season window lives in academy_settings; the trigger is the authority
		if (!result.ok) return setError(form, '', describeError(result.error.code), { status: 400 });
		return message(form, `ADDED · ${form.data.name.toUpperCase()}`);
	}
};
