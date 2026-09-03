import { z } from 'zod';
import { err, fromPostgres, ok, type Result } from '$lib/server/domain/result';
import { localDate, localTime, type ScheduleDb, uuid } from './common';
import { createSession, listByParent, type ScheduleSession } from './sessions';

// Camps are a seasonal EVENT, not an evergreen program (§13 of the product ledger), and the
// database refuses one outside the configured summer window. Phase 3 schedules the days;
// registration attaches to an order item and lands with payments in phase 5.

export const campSchema = z
	.object({
		name: z.string().trim().min(1, 'Name the camp').max(120, 'Too long'),
		startsOn: localDate,
		endsOn: localDate,
		capacity: z.coerce.number().int().min(1, 'At least one place').max(500, 'Too many'),
		description: z.string().trim().max(1000, 'Too long').default('')
	})
	.refine((v) => v.endsOn >= v.startsOn, {
		path: ['endsOn'],
		message: 'End on or after the start'
	});
export type CampInput = z.infer<typeof campSchema>;

export const campDaySchema = z
	.object({
		date: localDate,
		start: localTime,
		end: localTime,
		courtId: uuid,
		coachId: z.union([uuid, z.literal('')]).default('')
	})
	.refine((v) => v.end > v.start, { path: ['end'], message: 'End after the start' });
export type CampDayInput = z.infer<typeof campDaySchema>;

export type Camp = {
	id: string;
	name: string;
	startsOn: string;
	endsOn: string;
	capacity: number;
	description: string | null;
};

type CampRow = {
	id: string;
	name: string;
	starts_on: string;
	ends_on: string;
	capacity: number;
	description: string | null;
};

const toCamp = (c: CampRow): Camp => ({
	id: c.id,
	name: c.name,
	startsOn: c.starts_on,
	endsOn: c.ends_on,
	capacity: c.capacity,
	description: c.description
});

export async function listCamps(db: ScheduleDb): Promise<Result<Camp[]>> {
	const { data, error } = await db
		.from('camps')
		.select('id, name, starts_on, ends_on, capacity, description')
		.order('starts_on');
	if (error) return err(fromPostgres(error));
	return ok(((data ?? []) as unknown as CampRow[]).map(toCamp));
}

export async function getCamp(db: ScheduleDb, id: string): Promise<Result<Camp | null>> {
	const { data, error } = await db
		.from('camps')
		.select('id, name, starts_on, ends_on, capacity, description')
		.eq('id', id)
		.maybeSingle();
	if (error) return err(fromPostgres(error));
	return ok(data ? toCamp(data as unknown as CampRow) : null);
}

const campRow = (input: CampInput) => ({
	name: input.name,
	starts_on: input.startsOn,
	ends_on: input.endsOn,
	capacity: input.capacity,
	description: input.description || null
});

export async function createCamp(
	db: ScheduleDb,
	input: CampInput
): Promise<Result<{ id: string }>> {
	const { data, error } = await db.from('camps').insert(campRow(input)).select('id').single();
	if (error) return err(fromPostgres(error));
	return ok({ id: (data as { id: string }).id });
}

export async function updateCamp(
	db: ScheduleDb,
	id: string,
	input: CampInput
): Promise<Result<null>> {
	const { error } = await db.from('camps').update(campRow(input)).eq('id', id);
	if (error) return err(fromPostgres(error));
	return ok(null);
}

/** A camp day is an ordinary session with a camp parent — same availability gate as everything. */
export async function addCampDay(
	db: ScheduleDb,
	campId: string,
	input: CampDayInput,
	tz: string
): Promise<Result<{ id: string }>> {
	return createSession(
		db,
		{
			type: 'camp',
			parentId: campId,
			courtId: input.courtId,
			coachId: input.coachId,
			date: input.date,
			start: input.start,
			end: input.end,
			kind: 'practice',
			opponent: '',
			homeAway: '',
			notes: '',
			venueNote: ''
		},
		tz
	);
}

export const listCampDays = (db: ScheduleDb, campId: string): Promise<Result<ScheduleSession[]>> =>
	listByParent(db, 'camp', campId);
