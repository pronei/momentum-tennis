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
