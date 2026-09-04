import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '$lib/server/db/database.types';

export type SettingsDb = Pick<SupabaseClient<Database>, 'from'>;

/** Cupertino. The row in `academy_settings` is the authority; this is the fallback. */
export const DEFAULT_TIMEZONE = 'America/Los_Angeles';

/**
 * The academy timezone, for rendering only — SQL does its own conversions. Fails soft:
 * a missing settings row must not break a page or swallow a save confirmation.
 */
export async function getAcademyTimezone(db: SettingsDb): Promise<string> {
	const { data } = await db.from('academy_settings').select('timezone').maybeSingle();
	return data?.timezone ?? DEFAULT_TIMEZONE;
}

/** Policy the booking screens quote before the database enforces it. */
export type AcademySettings = {
	timezone: string;
	bookingHorizonDays: number;
	cancelNoticeHours: number;
	lowCreditThreshold: number;
};

/** The column defaults in 0001, repeated here only for the fails-soft path. */
export const DEFAULT_SETTINGS: AcademySettings = {
	timezone: DEFAULT_TIMEZONE,
	bookingHorizonDays: 70,
	cancelNoticeHours: 24,
	lowCreditThreshold: 2
};

/**
 * The academy's booking policy. Read to EXPLAIN — "cancel before 16:00 tomorrow and the credit
 * returns" — never to decide: `book_class` and `cancel_booking` read the same row and are the
 * authority. Fails soft for the same reason `getAcademyTimezone` does.
 */
export async function getAcademySettings(db: SettingsDb): Promise<AcademySettings> {
	const { data } = await db
		.from('academy_settings')
		.select('timezone, booking_horizon_days, cancel_notice_hours, low_credit_threshold')
		.maybeSingle();
	if (!data) return DEFAULT_SETTINGS;
	return {
		timezone: data.timezone ?? DEFAULT_SETTINGS.timezone,
		bookingHorizonDays: data.booking_horizon_days ?? DEFAULT_SETTINGS.bookingHorizonDays,
		cancelNoticeHours: data.cancel_notice_hours ?? DEFAULT_SETTINGS.cancelNoticeHours,
		lowCreditThreshold: data.low_credit_threshold ?? DEFAULT_SETTINGS.lowCreditThreshold
	};
}
