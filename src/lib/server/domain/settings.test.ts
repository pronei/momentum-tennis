import { describe, expect, it } from 'vitest';
import { DEFAULT_TIMEZONE, getAcademyTimezone, type SettingsDb } from './settings';

function fakeDb(reply: {
	data?: { timezone: string } | null;
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
