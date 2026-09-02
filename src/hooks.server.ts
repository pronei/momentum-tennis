import { error, redirect, type Handle } from '@sveltejs/kit';
import { sequence } from '@sveltejs/kit/hooks';
import { createRequestSupabase } from '$lib/server/db/client';
import { staffRoles } from '$lib/server/domain/identity/staff';

/** One RLS-scoped Supabase client per request, and a session getter that validates the JWT. */
const supabase: Handle = async ({ event, resolve }) => {
	event.locals.supabase = createRequestSupabase(event);
	event.locals.safeGetSession = async () => {
		const {
			data: { session }
		} = await event.locals.supabase.auth.getSession();
		if (!session) return { session: null, user: null };
		// getSession reads the cookie; getUser asks the auth server. Only the latter is trustworthy.
		const {
			data: { user },
			error: userError
		} = await event.locals.supabase.auth.getUser();
		if (userError || !user) return { session: null, user: null };
		return { session, user };
	};
	return resolve(event, {
		filterSerializedResponseHeaders: (name) =>
			name === 'content-range' || name === 'x-supabase-api-version'
	});
};

/**
 * Authorization at the server layer, before any load or action runs. Route groups carry the
 * policy: (portal) needs a session, /coach needs staff, /admin needs admin. RLS underneath is
 * defense in depth, never the only gate.
 */
const guards: Handle = async ({ event, resolve }) => {
	const { session, user } = await event.locals.safeGetSession();
	event.locals.session = session;
	event.locals.user = user;
	event.locals.roles = { isStaff: false, isAdmin: false, isCoach: false };

	const id = event.route.id ?? '';
	const needsUser =
		id.startsWith('/(portal)') || id.startsWith('/admin') || id.startsWith('/coach');
	if (needsUser && !user) {
		redirect(303, `/login?next=${encodeURIComponent(event.url.pathname + event.url.search)}`);
	}
	if (user && (id.startsWith('/admin') || id.startsWith('/coach'))) {
		event.locals.roles = await staffRoles(event.locals.supabase, user.id);
		if (id.startsWith('/admin') && !event.locals.roles.isAdmin) error(403, 'Admin only');
		if (id.startsWith('/coach') && !event.locals.roles.isStaff) error(403, 'Staff only');
	}
	return resolve(event);
};

export const handle = sequence(supabase, guards);
