import { describe, expect, it } from 'vitest';
import { campWindow } from './camps';

// A summer is every camp row of one year: the banner speaks of the season, not of one week.
const camps2027 = [
	{ name: 'Camp week 1', startsOn: '2027-06-07', endsOn: '2027-06-11' },
	{ name: 'Camp week 8', startsOn: '2027-07-26', endsOn: '2027-07-30' }
];

describe('campWindow — the seasonal banner reads the real camp dates', () => {
	it('with no camps on record the dates are coming', () => {
		expect(campWindow([], '2026-09-30')).toMatchObject({
			status: 'DATES COMING',
			window: 'ANNOUNCED EACH SPRING',
			note: 'ANNOUNCED EACH SPRING'
		});
	});

	it('before a season it returns, with the span of the whole summer', () => {
		expect(campWindow(camps2027, '2026-09-30')).toMatchObject({
			status: 'RETURNS 2027',
			window: 'JUN 7 – JUL 30, 2027',
			note: 'JUN 7 – JUL 30, 2027'
		});
	});

	it('during a season it is enrolling, through the last day inclusive', () => {
		for (const today of ['2027-06-07', '2027-06-20', '2027-07-30'])
			expect(campWindow(camps2027, today)).toMatchObject({
				status: 'ENROLLING NOW',
				window: 'JUN 7 – JUL 30',
				note: 'ENROLLING NOW'
			});
	});

	it('after the last season the dates are coming again', () => {
		expect(campWindow(camps2027, '2027-08-02').status).toBe('DATES COMING');
	});

	it('carries the kit’s label and blurb', () => {
		const w = campWindow([], '2026-09-30');
		expect(w.label).toBe('Summer camps at De Anza');
		expect(w.blurb).toContain('studio afternoons');
	});
});
