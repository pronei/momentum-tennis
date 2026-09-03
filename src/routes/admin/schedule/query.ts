import { academyDate } from '$lib/server/domain/time';

// What the day grid is showing, read off the URL so every state is linkable and the back button
// works. Nothing here trusts the query string: an unknown location or a date that does not exist
// falls back rather than sending a nonsense window to Postgres.

const ISO = /^\d{4}-\d{2}-\d{2}$/;
const realDate = (d: string) =>
	ISO.test(d) && new Date(`${d}T12:00:00Z`).toISOString().slice(0, 10) === d;

export function parseDayQuery(
	url: URL,
	tz: string,
	locationIds: string[]
): { locationId: string | null; localDate: string } {
	const asked = url.searchParams.get('location') ?? '';
	const date = url.searchParams.get('date') ?? '';
	return {
		locationId: locationIds.includes(asked) ? asked : (locationIds[0] ?? null),
		localDate: realDate(date) ? date : academyDate(new Date(), tz)
	};
}

const weekdayFormatters = new Map<string, Intl.DateTimeFormat>();

/** `2026-09-12 · SATURDAY` — the mono stamp above the grid. */
export function dayHeading(localDate: string, tz: string): string {
	let fmt = weekdayFormatters.get(tz);
	if (!fmt) {
		fmt = new Intl.DateTimeFormat('en-US', { timeZone: tz, weekday: 'long' });
		weekdayFormatters.set(tz, fmt);
	}
	// midday, so the weekday is the same on both sides of any DST change
	return `${localDate} · ${fmt.format(new Date(`${localDate}T12:00:00Z`)).toUpperCase()}`;
}

/** The previous and next day links. Calendar arithmetic, no timezone involved. */
export function shiftDate(localDate: string, days: number): string {
	const [y, m, d] = localDate.split('-').map(Number);
	return new Date(Date.UTC(y, m - 1, d + days)).toISOString().slice(0, 10);
}
