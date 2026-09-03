import type { SupabaseClient } from '@supabase/supabase-js';
import { z } from 'zod';
import type { Database } from '$lib/server/db/database.types';

/** The only surface the schedule modules need — injected, so they test without a database. */
export type ScheduleDb = Pick<SupabaseClient<Database>, 'from' | 'rpc'>;

/** An id arriving from a select or a URL. Shape-checked so a typo never reaches Postgres. */
export const uuid = z
	.string()
	.regex(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i, 'Choose one');

/** A local calendar date, YYYY-MM-DD. Templates and forms speak wall-clock; SQL converts. */
export const localDate = z
	.string()
	.regex(/^\d{4}-\d{2}-\d{2}$/, 'Use YYYY-MM-DD')
	.refine((v) => !Number.isNaN(Date.parse(`${v}T12:00:00Z`)), 'That date does not exist');

/** A local wall-clock time, HH:MM (24h) — the mono convention, and what Postgres `time` takes. */
export const localTime = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Use HH:MM');

/** ISO weekday: 1 = Monday … 7 = Sunday, matching `extract(isodow …)`. */
export const isoWeekday = z.coerce.number().int().min(1, 'Pick a day').max(7, 'Pick a day');

/** The slot lengths a reservation window may be divided into (0001's check constraint). */
export const SLOT_MINUTES = [30, 45, 60, 90, 120] as const;
