import { listLocations } from '$lib/server/domain/schedule/locations';
import { listDay } from '$lib/server/domain/schedule/sessions';
import { describeError } from '$lib/server/domain/result';
import { getAcademyTimezone } from '$lib/server/domain/settings';
import { academyDate, academyTime } from '$lib/server/domain/time';
import { dayHeading, parseDayQuery, shiftDate } from './query';
import type { PageServerLoad } from './$types';

// hooks.server.ts has already refused anyone who is not an admin.

export const load: PageServerLoad = async ({ url, locals }) => {
	const tz = await getAcademyTimezone(locals.supabase);
	const venues = await listLocations(locals.supabase);
	const list = venues.ok ? venues.value.filter((v) => v.active) : [];
	const { locationId, localDate } = parseDayQuery(
		url,
		tz,
		list.map((v) => v.id)
	);
	const day = locationId ? await listDay(locals.supabase, { locationId, localDate, tz }) : null;
	const today = academyDate(new Date(), tz);

	return {
		localDate,
		locationId,
		today,
		heading: dayHeading(localDate, tz),
		prevDate: shiftDate(localDate, -1),
		nextDate: shiftDate(localDate, 1),
		locations: list.map((v) => ({ value: v.id, label: v.name })),
		courts:
			list
				.find((v) => v.id === locationId)
				?.courts.filter((c) => c.active)
				.map((c) => ({ id: c.id, label: c.name })) ?? [],
		sessions: (day?.ok ? day.value : []).map((s) => ({
			id: s.id,
			court: s.courtId ?? '',
			start: academyTime(s.startsAt, tz),
			end: academyTime(s.endsAt, tz),
			type: s.type,
			title: s.title,
			coach: s.coachName?.toUpperCase(),
			cancelled: s.cancelled
		})),
		// the amber line means "now", so it appears on today's column and nowhere else
		nowTime: localDate === today ? academyTime(new Date(), tz) : undefined,
		loadError: !venues.ok
			? describeError(venues.error.code)
			: day && !day.ok
				? describeError(day.error.code)
				: null
	};
};
