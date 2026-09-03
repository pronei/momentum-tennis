// Display-side academy-time helpers. The database owns every time-based invariant
// (academy_week_start, academy_scope, availability); these only render and group for the UI,
// and they mirror the SQL semantics exactly so what the family sees is what the cap enforces.

type Parts = { y: string; m: string; d: string; hh: string; mm: string; wd: string };
const formatters = new Map<string, Intl.DateTimeFormat>();

function parts(iso: string | Date, tz: string): Parts {
	let fmt = formatters.get(tz);
	if (!fmt) {
		fmt = new Intl.DateTimeFormat('en-US', {
			timeZone: tz,
			hourCycle: 'h23',
			weekday: 'short',
			year: 'numeric',
			month: '2-digit',
			day: '2-digit',
			hour: '2-digit',
			minute: '2-digit'
		});
		formatters.set(tz, fmt);
	}
	const p: Record<string, string> = {};
	for (const { type, value } of fmt.formatToParts(new Date(iso)))
		if (type !== 'literal') p[type] = value;
	return { y: p.year, m: p.month, d: p.day, hh: p.hour, mm: p.minute, wd: p.weekday };
}

/** YYYY-MM-DD in academy time */
export function academyDate(iso: string | Date, tz: string): string {
	const { y, m, d } = parts(iso, tz);
	return `${y}-${m}-${d}`;
}

/** HH:MM (24h) in academy time — the mono convention */
export function academyTime(iso: string | Date, tz: string): string {
	const { hh, mm } = parts(iso, tz);
	return `${hh}:${mm}`;
}

/** `SAT 09:00–11:00` */
export function academyRange(start: string | Date, end: string | Date, tz: string): string {
	return `${parts(start, tz).wd.toUpperCase()} ${academyTime(start, tz)}–${academyTime(end, tz)}`;
}

/** Local calendar date as a UTC-midnight Date, for weekday arithmetic without tz drift */
function localDay(iso: string | Date, tz: string): Date {
	const { y, m, d } = parts(iso, tz);
	return new Date(Date.UTC(Number(y), Number(m) - 1, Number(d)));
}

/** ISO Monday (YYYY-MM-DD) of the academy-local week — mirrors academy_week_start() */
export function isoWeekStart(iso: string | Date, tz: string): string {
	const day = localDay(iso, tz);
	day.setUTCDate(day.getUTCDate() - ((day.getUTCDay() + 6) % 7));
	return day.toISOString().slice(0, 10);
}

/** 'weekday' | 'weekend' by the academy-local day — mirrors academy_scope() */
export function scopeOf(iso: string | Date, tz: string): 'weekday' | 'weekend' {
	const dow = localDay(iso, tz).getUTCDay();
	return dow === 0 || dow === 6 ? 'weekend' : 'weekday';
}

/** Signed offset of `tz` from UTC at `instant`, in ms — derived with Intl, never hard-coded. */
function offsetMs(instant: number, tz: string): number {
	const p = parts(new Date(instant), tz);
	const seconds = new Date(instant).getUTCSeconds();
	return (
		Date.UTC(Number(p.y), Number(p.m) - 1, Number(p.d), Number(p.hh), Number(p.mm), seconds) -
		instant
	);
}

/**
 * The UTC instants bounding a local calendar day: `[startsAt, endsAt)` for `localDate`
 * (YYYY-MM-DD) in `tz`. A day is 23, 24 or 25 hours long depending on DST, so both ends are
 * resolved independently — the pair is what a `starts_at >= … and starts_at < …` query needs.
 */
export function dayBounds(localDate: string, tz: string): { startsAt: string; endsAt: string } {
	const [y, m, d] = localDate.split('-').map(Number);
	const nextDate = new Date(Date.UTC(y, m - 1, d + 1)).toISOString().slice(0, 10);
	return { startsAt: localMidnight(localDate, tz), endsAt: localMidnight(nextDate, tz) };
}

/** UTC instant of the midnight that opens `localDate` in `tz`. */
function localMidnight(localDate: string, tz: string): string {
	const [y, m, d] = localDate.split('-').map(Number);
	const wall = Date.UTC(y, m - 1, d);
	// One correction pass: the offset at the guess can differ from the offset at the answer
	// across a DST edge, and applying the answer's own offset settles it.
	const guess = wall - offsetMs(wall, tz);
	return new Date(wall - offsetMs(guess, tz)).toISOString();
}
