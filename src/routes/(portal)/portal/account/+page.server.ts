import { fail } from '@sveltejs/kit';
import { message, setError, superValidate } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';
import { profileSchema, updateProfile } from '$lib/server/domain/identity/account';
import { describeError } from '$lib/server/domain/result';
import { getAcademyTimezone } from '$lib/server/domain/settings';
import { academyTime } from '$lib/server/domain/time';
import type { Actions, PageServerLoad } from './$types';

// The pattern every later form copies: superforms + zod at the boundary, a domain function
// that returns a Result, describeError for the copy. The route never sees a Postgres message.

export const load: PageServerLoad = async ({ parent }) => {
	const { account } = await parent();
	const form = await superValidate(
		{ fullName: account.full_name, phone: account.phone ?? '' },
		zod4(profileSchema)
	);
	return { form };
};

export const actions: Actions = {
	default: async ({ request, locals }) => {
		const form = await superValidate(request, zod4(profileSchema));
		if (!form.valid) return fail(400, { form });
		const result = await updateProfile(locals.supabase, locals.user!.id, form.data);
		if (!result.ok) return setError(form, '', describeError(result.error.code), { status: 400 });
		const tz = await getAcademyTimezone(locals.supabase);
		return message(form, `SAVED · ${academyTime(new Date(), tz)}`);
	}
};
