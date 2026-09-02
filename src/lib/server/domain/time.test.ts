import { describe, expect, it } from 'vitest';
import { academyDate, academyRange, academyTime, isoWeekStart, scopeOf } from './time';

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
