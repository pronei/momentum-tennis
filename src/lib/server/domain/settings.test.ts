import { describe, expect, it } from 'vitest';
import {
	DEFAULT_SETTINGS,
	DEFAULT_TIMEZONE,
	getAcademySettings,
	getAcademyTimezone,
	type SettingsDb
} from './settings';

function fakeDb(reply: {
	data?: Record<string, unknown> | null;
	error?: { message: string };
}): SettingsDb {
	return {
		from: () => ({
			select: () => ({ maybeSingle: () => Promise.resolve({ data: null, error: null, ...reply }) })
		})
	} as unknown as SettingsDb;
}

describe('getAcademyTimezone', () => {
	it('returns the configured timezone', async () => {
		expect(await getAcademyTimezone(fakeDb({ data: { timezone: 'America/New_York' } }))).toBe(
			'America/New_York'
		);
	});
	it('falls back to the academy default when the row or the query is missing', async () => {
		expect(await getAcademyTimezone(fakeDb({ data: null }))).toBe(DEFAULT_TIMEZONE);
		expect(await getAcademyTimezone(fakeDb({ error: { message: 'boom' } }))).toBe(DEFAULT_TIMEZONE);
	});
});

describe('getAcademySettings — the numbers booking asks about before it asks the database', () => {
	it('returns the configured policy', async () => {
		const db = fakeDb({
			data: {
				timezone: 'America/Los_Angeles',
				booking_horizon_days: 42,
				cancel_notice_hours: 12,
				low_credit_threshold: 3
			}
		});
		expect(await getAcademySettings(db)).toEqual({
			timezone: 'America/Los_Angeles',
			bookingHorizonDays: 42,
			cancelNoticeHours: 12,
			lowCreditThreshold: 3
		});
	});

	it('fails soft — a missing row must not stop a family seeing their schedule', async () => {
		expect(await getAcademySettings(fakeDb({ data: null }))).toEqual(DEFAULT_SETTINGS);
		expect(await getAcademySettings(fakeDb({ error: { message: 'boom' } }))).toEqual(
			DEFAULT_SETTINGS
		);
	});
});
