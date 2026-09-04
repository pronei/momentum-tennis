import { describeError } from '$lib/server/domain/result';
import { listDay } from '$lib/server/domain/schedule/sessions';
import { getAcademySettings } from '$lib/server/domain/settings';
import { academyDate, academyTime } from '$lib/server/domain/time';
import { dayHeading, shiftDate } from '../../admin/schedule/query';
import type { PageServerLoad } from './$types';

// hooks.server.ts has already refused anyone who is not staff.

export const load: PageServerLoad = async ({ url, locals }) => {
	const settings = await getAcademySettings(locals.supabase);
	const tz = settings.timezone;
	const today = academyDate(new Date(), tz);
	const asked = url.searchParams.get('date') ?? '';
	const localDate = /^\d{4}-\d{2}-\d{2}$/.test(asked) ? asked : today;

	// Every location: a coach's day crosses venues, and there are two.
	const { data: locations } = await locals.supabase
		.from('locations')
		.select('id')
		.eq('active', true);
	const days = await Promise.all(
		(locations ?? []).map((l) => listDay(locals.supabase, { locationId: l.id, localDate, tz }))
	);
	const failed = days.find((d) => !d.ok);

	return {
		localDate,
		today,
		heading: dayHeading(localDate, tz),
		prevDate: shiftDate(localDate, -1),
		nextDate: shiftDate(localDate, 1),
		sessions: days
			.flatMap((d) => (d.ok ? d.value : []))
			.filter((s) => !s.cancelled)
			.sort((a, b) => a.startsAt.localeCompare(b.startsAt))
			.map((s) => ({
				id: s.id,
				type: s.type,
				title: s.title,
				hours: `${academyTime(s.startsAt, tz)}–${academyTime(s.endsAt, tz)}`,
				where: s.courtName ? `${s.courtName} · ${s.locationName}` : '—'
			})),
		loadError: failed && !failed.ok ? describeError(failed.error.code) : null
	};
};
