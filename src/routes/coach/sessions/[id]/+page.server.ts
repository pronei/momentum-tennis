import { error, fail } from '@sveltejs/kit';
import { mark, roster, settle } from '$lib/server/domain/booking/attendance';
import { describeError } from '$lib/server/domain/result';
import { getSession } from '$lib/server/domain/schedule/sessions';
import { getAcademySettings } from '$lib/server/domain/settings';
import { academyDate, academyTime } from '$lib/server/domain/time';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, locals }) => {
	const settings = await getAcademySettings(locals.supabase);
	const found = await getSession(locals.supabase, params.id);
	if (!found.ok) error(500, describeError(found.error.code));
	if (!found.value) error(404, 'No such session');
	const session = found.value;

	const players = await roster(locals.supabase, params.id);
	const tz = settings.timezone;
	return {
		session: {
			id: session.id,
			title: session.title,
			date: academyDate(session.startsAt, tz),
			hours: `${academyTime(session.startsAt, tz)}–${academyTime(session.endsAt, tz)}`,
			where: session.courtName ? `${session.courtName} · ${session.locationName}` : '—',
			cancelled: session.cancelled,
			// settlement is only meaningful once the session is over
			ended: new Date(session.endsAt) <= new Date()
		},
		roster: players.ok ? players.value : [],
		loadError: players.ok ? null : describeError(players.error.code)
	};
};

export const actions: Actions = {
	mark: async ({ request, params, locals }) => {
		const data = await request.formData();
		const playerId = String(data.get('playerId') ?? '');
		const present = data.get('present') === 'true';
		if (!playerId) return fail(400, { markError: describeError('validation') });
		// marked_by must be the caller: the insert policy says so, and the row is the record of
		// who took the register
		const result = await mark(locals.supabase, {
			sessionId: params.id,
			playerId,
			present,
			markedBy: locals.user!.id
		});
		if (!result.ok) return fail(400, { markError: describeError(result.error.code) });
		return { marked: playerId };
	},

	// Turns an absence into a no_show and asks apply_forgiveness whether this package's one
	// forgiven skip is still available. Cron owns this from phase 7; staff may run it now.
	settle: async ({ locals }) => {
		const result = await settle(locals.supabase);
		if (!result.ok) return fail(400, { settleError: describeError(result.error.code) });
		return { settled: result.value.settled };
	}
};
