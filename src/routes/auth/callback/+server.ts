import { redirect } from '@sveltejs/kit';
import { safeRedirectPath } from '$lib/server/auth/redirect';
import type { RequestHandler } from './$types';

/** Email confirmation / magic link landing: exchange the code for a session, then continue. */
export const GET: RequestHandler = async ({ url, locals }) => {
	const code = url.searchParams.get('code');
	const next = safeRedirectPath(url.searchParams.get('next'));
	if (code) {
		const { error } = await locals.supabase.auth.exchangeCodeForSession(code);
		if (!error) redirect(303, next);
	}
	redirect(303, '/login?error=link');
};
