import { describe, expect, it } from 'vitest';
import { academyDate, academyRange, academyTime, dayBounds, isoWeekStart, scopeOf } from './time';

const LA = 'America/Los_Angeles';

describe('academy time helpers (display only — the database is the authority)', () => {
	it('renders UTC instants as academy-local date and time', () => {
		// 2026-09-14 16:00 PDT == 23:00Z
		expect(academyDate('2026-09-14T23:00:00Z', LA)).toBe('2026-09-14');
		expect(academyTime('2026-09-14T23:00:00Z', LA)).toBe('16:00');
	});

	it('is DST-correct on both sides of the spring transition', () => {
		// 2026-03-07 16:00 PST == 00:00Z next day; 2026-03-08 16:00 PDT == 23:00Z
		expect(academyTime('2026-03-08T00:00:00Z', LA)).toBe('16:00');
		expect(academyTime('2026-03-08T23:00:00Z', LA)).toBe('16:00');
		expect(academyDate('2026-03-08T00:00:00Z', LA)).toBe('2026-03-07');
	});

	it('formats a range in the mono convention: SAT 09:00–11:00', () => {
		expect(academyRange('2026-09-19T16:00:00Z', '2026-09-19T18:00:00Z', LA)).toBe(
			'SAT 09:00–11:00'
		);
	});

	it('ISO week starts on Monday in academy time (matches academy_week_start in SQL)', () => {
		expect(isoWeekStart('2026-09-14T23:00:00Z', LA)).toBe('2026-09-14'); // Monday
		expect(isoWeekStart('2026-09-20T18:00:00Z', LA)).toBe('2026-09-14'); // Sunday belongs to the same week
		// Sunday 2026-09-20 23:30 PDT is Monday 06:30Z — the LOCAL day decides
		expect(isoWeekStart('2026-09-21T06:30:00Z', LA)).toBe('2026-09-14');
	});

	it('scope follows the local weekday: Sat/Sun = weekend', () => {
		expect(scopeOf('2026-09-19T16:00:00Z', LA)).toBe('weekend');
		expect(scopeOf('2026-09-14T23:00:00Z', LA)).toBe('weekday');
		expect(scopeOf('2026-09-21T06:30:00Z', LA)).toBe('weekend'); // still Sunday in LA
	});
});

describe('dayBounds — the UTC window a calendar day query needs', () => {
	it('spans a local calendar day in UTC, including the 25-hour DST day', () => {
		expect(dayBounds('2026-09-12', LA)).toEqual({
			startsAt: '2026-09-12T07:00:00.000Z',
			endsAt: '2026-09-13T07:00:00.000Z'
		});
		// 2026-11-01 is the Sunday US clocks fall back: 25 hours, not 24
		const fallBack = dayBounds('2026-11-01', LA);
		expect(fallBack.startsAt).toBe('2026-11-01T07:00:00.000Z');
		expect(new Date(fallBack.endsAt).getTime() - new Date(fallBack.startsAt).getTime()).toBe(
			25 * 3_600_000
		);
	});

	it('rolls over month and year ends', () => {
		expect(dayBounds('2026-12-31', LA).endsAt).toBe('2027-01-01T08:00:00.000Z');
		expect(dayBounds('2026-01-31', LA).endsAt).toBe('2026-02-01T08:00:00.000Z');
	});
});
