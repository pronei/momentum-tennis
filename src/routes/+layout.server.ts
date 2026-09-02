import type { LayoutServerLoad } from './$types';

const DEFAULT_TZ = 'America/Los_Angeles';

/** Session facts every page can render against (never the access token), plus the academy timezone. */
export const load: LayoutServerLoad = async ({ locals }) => {
	const { data: settings } = await locals.supabase
		.from('academy_settings')
		.select('timezone')
		.maybeSingle();
	return {
		session: locals.session,
		user: locals.user ? { id: locals.user.id, email: locals.user.email ?? null } : null,
		roles: locals.roles,
		tz: settings?.timezone ?? DEFAULT_TZ
	};
};
