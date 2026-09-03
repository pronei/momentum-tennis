import { describe, expect, it } from 'vitest';
import { ageOn, isAdultOn } from './age';

const LA = 'America/Los_Angeles';

describe('isAdultOn — mirrors player_is_adult() in SQL', () => {
	it('is true on the 18th birthday and false the day before', () => {
		expect(isAdultOn('2008-09-02', LA, '2026-09-02T18:00:00Z')).toBe(true);
		expect(isAdultOn('2008-09-03', LA, '2026-09-02T18:00:00Z')).toBe(false);
	});
	it('uses the academy-local date, not UTC', () => {
		// 2026-09-03T05:00Z is still 2026-09-02 in Los Angeles, so this player is not adult yet
		expect(isAdultOn('2008-09-03', LA, '2026-09-03T05:00:00Z')).toBe(false);
		expect(isAdultOn('2008-09-03', LA, '2026-09-03T18:00:00Z')).toBe(true);
	});
	it('handles a leap-day birthdate', () => {
		expect(isAdultOn('2008-02-29', LA, '2026-02-28T18:00:00Z')).toBe(false);
		expect(isAdultOn('2008-02-29', LA, '2026-03-01T18:00:00Z')).toBe(true);
	});
});

describe('ageOn — whole years in academy-local time', () => {
	it('counts the birthday as the increment', () => {
		expect(ageOn('2015-03-01', LA, '2026-02-28T18:00:00Z')).toBe(10);
		expect(ageOn('2015-03-01', LA, '2026-03-01T18:00:00Z')).toBe(11);
	});
});
