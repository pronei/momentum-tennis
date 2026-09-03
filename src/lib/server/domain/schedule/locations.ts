import { z } from 'zod';
import { err, fromPostgres, ok, type Result } from '$lib/server/domain/result';
import { type ScheduleDb, uuid } from './common';

// Venues and their courts (decision H). A court belongs to exactly one location, and nothing
// can be scheduled on it until a reservation window says the academy has it — that rule lives
// in `availability.ts` and in the database, not here.

export const locationSchema = z.object({
	name: z.string().trim().min(1, 'Enter a name').max(120, 'Too long'),
	address: z.string().trim().max(240, 'Too long').default('')
});
export type LocationInput = z.infer<typeof locationSchema>;

export const courtSchema = z.object({
	locationId: uuid,
	name: z.string().trim().min(1, 'Enter a name').max(64, 'Too long')
});
export type CourtInput = z.infer<typeof courtSchema>;

export type Court = { id: string; locationId: string; name: string; active: boolean };
export type Location = {
	id: string;
	name: string;
	address: string | null;
	active: boolean;
	courts: Court[];
};

type LocationRow = { id: string; name: string; address: string | null; active: boolean };
type CourtRow = { id: string; location_id: string; name: string; active: boolean };

/** Every location with its courts — the tree the schedule and availability screens navigate. */
export async function listLocations(db: ScheduleDb): Promise<Result<Location[]>> {
	const { data: locations, error } = await db
		.from('locations')
		.select('id, name, address, active')
		.order('name');
	if (error) return err(fromPostgres(error));
	const { data: courts, error: courtError } = await db
		.from('courts')
		.select('id, location_id, name, active')
		.order('name');
	if (courtError) return err(fromPostgres(courtError));

	const rows = (courts ?? []) as unknown as CourtRow[];
	return ok(
		((locations ?? []) as unknown as LocationRow[]).map((l) => ({
			...l,
			courts: rows
				.filter((c) => c.location_id === l.id)
				.map((c) => ({ id: c.id, locationId: c.location_id, name: c.name, active: c.active }))
		}))
	);
}

export async function createLocation(
	db: ScheduleDb,
	input: LocationInput
): Promise<Result<{ id: string }>> {
	const { data, error } = await db
		.from('locations')
		.insert({ name: input.name, address: input.address || null })
		.select('id')
		.single();
	if (error) return err(fromPostgres(error));
	return ok({ id: (data as { id: string }).id });
}

export async function createCourt(
	db: ScheduleDb,
	input: CourtInput
): Promise<Result<{ id: string }>> {
	const { data, error } = await db
		.from('courts')
		.insert({ location_id: input.locationId, name: input.name })
		.select('id')
		.single();
	if (error) return err(fromPostgres(error));
	return ok({ id: (data as { id: string }).id });
}

/** Renaming and deactivating are the same act: an update. A court is never deleted — sessions
 *  and audit rows point at it, and `active: false` is what takes it out of the pickers. */
export async function updateLocation(
	db: ScheduleDb,
	id: string,
	patch: Partial<{ name: string; address: string | null; active: boolean }>
): Promise<Result<null>> {
	const { error } = await db.from('locations').update(patch).eq('id', id);
	if (error) return err(fromPostgres(error));
	return ok(null);
}

export async function updateCourt(
	db: ScheduleDb,
	id: string,
	patch: Partial<{ name: string; active: boolean }>
): Promise<Result<null>> {
	const { error } = await db.from('courts').update(patch).eq('id', id);
	if (error) return err(fromPostgres(error));
	return ok(null);
}
