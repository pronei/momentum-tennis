import { describeError } from '$lib/server/domain/result';
import { filterForPlayer, listRange } from '$lib/server/domain/schedule/sessions';
import { getAcademyTimezone } from '$lib/server/domain/settings';
import { academyDate, academyTime } from '$lib/server/domain/time';
import type { PageServerLoad } from './$types';

const DAYS = 14;

export const load: PageServerLoad = async ({ locals, parent }) => {
	const { currentPlayer } = await parent();
	const tz = await getAcademyTimezone(locals.supabase);
	const from = academyDate(new Date(), tz);
	const range = await listRange(locals.supabase, { from, days: DAYS, tz });

	// N: the same rule enforce_class_booking applies, so a family is never shown a slot that
	// booking would then refuse.
	const visible = range.ok ? filterForPlayer(range.value, currentPlayer?.levelKey ?? null) : [];

	const byDay = new Map<string, typeof visible>();
	for (const s of visible) {
		const day = academyDate(s.startsAt, tz);
		byDay.set(day, [...(byDay.get(day) ?? []), s]);
	}

	return {
		days: [...byDay.entries()].map(([date, sessions]) => ({
			date,
			sessions: sessions.map((s) => ({
				id: s.id,
				title: s.title,
				type: s.type,
				hours: `${academyTime(s.startsAt, tz)}–${academyTime(s.endsAt, tz)}`,
				where: s.courtName ? `${s.courtName} · ${s.locationName}` : (s.venueNote ?? 'AWAY'),
				levelKeys: s.levelKeys
			}))
		})),
		from,
		loadError: range.ok ? null : describeError(range.error.code)
	};
};
