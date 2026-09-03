import { describe, expect, it } from 'vitest';
import { dayHeading, parseDayQuery, shiftDate } from './query';

const LA = 'America/Los_Angeles';
const url = (qs: string) => new URL(`http://x/admin/schedule${qs}`);

describe('parseDayQuery — what day and which venue the grid is showing', () => {
	it('defaults to today in academy time and the first location', () => {
		const today = new Intl.DateTimeFormat('en-CA', { timeZone: LA }).format(new Date());
		expect(parseDayQuery(url(''), LA, ['loc-1', 'loc-2'])).toEqual({
			locationId: 'loc-1',
			localDate: today
		});
	});
	it('honours a valid date and a known location', () => {
		expect(parseDayQuery(url('?date=2026-09-12&location=loc-2'), LA, ['loc-1', 'loc-2'])).toEqual({
			locationId: 'loc-2',
			localDate: '2026-09-12'
		});
	});
	it('ignores a malformed date rather than querying a nonsense window', () => {
		const today = new Intl.DateTimeFormat('en-CA', { timeZone: LA }).format(new Date());
		expect(parseDayQuery(url('?date=yesterday'), LA, ['loc-1']).localDate).toBe(today);
		expect(parseDayQuery(url('?date=2026-02-30'), LA, ['loc-1']).localDate).toBe(today);
	});
	it('falls back to the first location when the one asked for is not ours', () => {
		expect(parseDayQuery(url('?location=elsewhere'), LA, ['loc-1']).locationId).toBe('loc-1');
	});
	it('has no location to show before any venue exists', () => {
		expect(parseDayQuery(url(''), LA, []).locationId).toBeNull();
	});
});

describe('the day heading and its neighbours', () => {
	it('reads as the mono date stamp the grid expects', () => {
		expect(dayHeading('2026-09-12', LA)).toBe('2026-09-12 · SATURDAY');
		expect(dayHeading('2026-11-01', LA)).toBe('2026-11-01 · SUNDAY');
	});
	it('steps a day at a time across month ends', () => {
		expect(shiftDate('2026-09-12', 1)).toBe('2026-09-13');
		expect(shiftDate('2026-09-01', -1)).toBe('2026-08-31');
		expect(shiftDate('2026-12-31', 1)).toBe('2027-01-01');
	});
});
