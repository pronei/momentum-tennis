import { getAcademyTimezone } from '$lib/server/domain/settings';
import type { LayoutServerLoad } from './$types';

/** Session facts every page can render against (never the access token), plus the academy timezone. */
export const load: LayoutServerLoad = async ({ locals }) => ({
	session: locals.session,
	user: locals.user ? { id: locals.user.id, email: locals.user.email ?? null } : null,
	roles: locals.roles,
	tz: await getAcademyTimezone(locals.supabase)
});
