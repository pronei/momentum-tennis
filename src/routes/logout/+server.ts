import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

/** POST only — logging out by GET is a CSRF footgun. */
export const POST: RequestHandler = async ({ locals }) => {
	await locals.supabase.auth.signOut();
	redirect(303, '/');
};
