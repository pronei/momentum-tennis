import { error, fail } from '@sveltejs/kit';
import { message, setError, superValidate } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';
import { searchPlayers } from '$lib/server/domain/identity/players';
import { describeError } from '$lib/server/domain/result';
import { listLocations } from '$lib/server/domain/schedule/locations';
import {
	addMember,
	addTeamSession,
	getTeam,
	listTeamSessions,
	removeMember,
	roster,
	teamSessionSchema
} from '$lib/server/domain/schedule/teams';
import { getAcademyTimezone } from '$lib/server/domain/settings';
import { academyDate, academyTime } from '$lib/server/domain/time';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, url, locals }) => {
	const found = await getTeam(locals.supabase, params.id);
	if (!found.ok) error(500, describeError(found.error.code));
	if (!found.value) error(404, 'No such team');
	const team = found.value;

	const tz = await getAcademyTimezone(locals.supabase);
	const query = url.searchParams.get('q') ?? '';
	const [members, sessions, matches, venues] = await Promise.all([
		roster(locals.supabase, team.id),
		listTeamSessions(locals.supabase, team.id),
		searchPlayers(locals.supabase, query),
		listLocations(locals.supabase)
	]);
	const onTeam = new Set((members.ok ? members.value : []).map((m) => m.playerId));

	return {
		team,
		query,
		roster: members.ok ? members.value : [],
		sessions: (sessions.ok ? sessions.value : []).map((s) => ({
			id: s.id,
			date: academyDate(s.startsAt, tz),
			hours: `${academyTime(s.startsAt, tz)}–${academyTime(s.endsAt, tz)}`,
			title: s.title,
			where: s.courtName ?? s.venueNote ?? 'AWAY',
			state: s.cancelled ? 'CANCELLED' : 'SCHEDULED'
		})),
		// already on the roster is not a candidate
		candidates: (matches.ok ? matches.value : []).filter((p) => !onTeam.has(p.id)),
		loadError: !members.ok
			? describeError(members.error.code)
			: !sessions.ok
				? describeError(sessions.error.code)
				: null,
		courts: (venues.ok ? venues.value : [])
			.filter((v) => v.active)
			.flatMap((v) =>
				v.courts
					.filter((c) => c.active)
					.map((c) => ({ value: c.id, label: `${c.name} · ${v.name}` }))
			),
		sessionForm: await superValidate(zod4(teamSessionSchema), { id: 'teamSession' })
	};
};

export const actions: Actions = {
	add: async ({ request, params, locals }) => {
		const playerId = String((await request.formData()).get('playerId') ?? '');
		if (!playerId) return fail(400, { rosterError: describeError('validation') });
		const result = await addMember(locals.supabase, params.id, playerId);
		if (!result.ok) return fail(400, { rosterError: describeError(result.error.code) });
		return { added: playerId };
	},

	// Dated, never deleted: a season roster is the record of who actually played.
	remove: async ({ request, params, locals }) => {
		const playerId = String((await request.formData()).get('playerId') ?? '');
		if (!playerId) return fail(400, { rosterError: describeError('validation') });
		const result = await removeMember(locals.supabase, params.id, playerId);
		if (!result.ok) return fail(400, { rosterError: describeError(result.error.code) });
		return { removed: playerId };
	},

	session: async ({ request, params, locals }) => {
		const form = await superValidate(request, zod4(teamSessionSchema), { id: 'teamSession' });
		if (!form.valid) return fail(400, { form });
		const tz = await getAcademyTimezone(locals.supabase);
		const result = await addTeamSession(locals.supabase, params.id, form.data, tz);
		if (!result.ok) return setError(form, '', describeError(result.error.code), { status: 400 });
		return message(form, `ADDED · ${form.data.date} ${form.data.start}`);
	}
};
