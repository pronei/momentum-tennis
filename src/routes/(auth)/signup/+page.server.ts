import { fail, redirect } from '@sveltejs/kit';
import { message, superValidate } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';
import { getConfig } from '$lib/server/config.runtime';
import { signupSchema } from '$lib/server/auth/schemas';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	if (locals.user) redirect(303, '/portal');
	return { form: await superValidate(zod4(signupSchema)) };
};

export const actions: Actions = {
	default: async ({ request, locals }) => {
		const form = await superValidate(request, zod4(signupSchema));
		if (!form.valid) return fail(400, { form });
		const { error } = await locals.supabase.auth.signUp({
			email: form.data.email,
			password: form.data.password,
			options: {
				data: { full_name: form.data.fullName },
				emailRedirectTo: `${getConfig().siteUrl}/auth/callback?next=/portal/account`
			}
		});
		if (error)
			return message(form, 'That email cannot be used. Try logging in instead.', { status: 400 });
		// Confirmation is on by default (supabase/config.toml): the account is usable after the email link.
		return message(form, 'Check your email for a confirmation link.');
	}
};
