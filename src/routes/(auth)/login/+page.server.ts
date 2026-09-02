import { fail, redirect } from '@sveltejs/kit';
import { message, superValidate } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';
import { safeRedirectPath } from '$lib/server/auth/redirect';
import { loginSchema } from '$lib/server/auth/schemas';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, url }) => {
	if (locals.user) redirect(303, safeRedirectPath(url.searchParams.get('next')));
	return { form: await superValidate(zod4(loginSchema)) };
};

export const actions: Actions = {
	default: async ({ request, locals, url }) => {
		const form = await superValidate(request, zod4(loginSchema));
		if (!form.valid) return fail(400, { form });
		const { error } = await locals.supabase.auth.signInWithPassword(form.data);
		if (error) return message(form, 'Email or password did not match.', { status: 400 });
		redirect(303, safeRedirectPath(url.searchParams.get('next')));
	}
};
