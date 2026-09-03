import { describeError } from '$lib/server/domain/result';
import { listRange } from '$lib/server/domain/schedule/sessions';
import { getAcademyTimezone } from '$lib/server/domain/settings';
import { academyDate, academyTime } from '$lib/server/domain/time';
import type { PageServerLoad } from './$types';

// Public and unauthenticated. RLS is what makes that safe: `read_sessions` shows anon only
// scheduled sessions, and the view's coach names come through for staff alone.

const DAYS = 14;

export const load: PageServerLoad = async ({ locals }) => {
	const tz = await getAcademyTimezone(locals.supabase);
	const from = academyDate(new Date(), tz);
	const range = await listRange(locals.supabase, { from, days: DAYS, tz });
	const sessions = range.ok ? range.value : [];

	const byDay = new Map<string, typeof sessions>();
	for (const s of sessions) {
		const day = academyDate(s.startsAt, tz);
		byDay.set(day, [...(byDay.get(day) ?? []), s]);
	}

	return {
		days: [...byDay.entries()].map(([date, list]) => ({
			date,
			sessions: list.map((s) => ({
				id: s.id,
				title: s.title,
				hours: `${academyTime(s.startsAt, tz)}–${academyTime(s.endsAt, tz)}`,
				where: s.courtName ? `${s.courtName} · ${s.locationName}` : (s.venueNote ?? 'AWAY')
			}))
		})),
		loadError: range.ok ? null : describeError(range.error.code)
	};
};
