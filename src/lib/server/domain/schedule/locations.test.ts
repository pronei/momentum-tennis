import { describe, expect, it } from 'vitest';
import { called, fakeDb } from './fakes';
import {
	courtSchema,
	createCourt,
	createLocation,
	listLocations,
	locationSchema,
	updateCourt,
	updateLocation
} from './locations';

const LOC = '11111111-1111-1111-1111-111111111111';

describe('schemas — a venue and a court are named things', () => {
	it('a location needs a name; the address is optional', () => {
		expect(locationSchema.parse({ name: '  Murdock Park ', address: '' }).name).toBe(
			'Murdock Park'
		);
		expect(locationSchema.safeParse({ name: '   ', address: '' }).success).toBe(false);
	});
	it('a court needs a name and a location it belongs to', () => {
		expect(courtSchema.safeParse({ locationId: LOC, name: 'MP-1' }).success).toBe(true);
		expect(courtSchema.safeParse({ locationId: LOC, name: '  ' }).success).toBe(false);
		expect(courtSchema.safeParse({ locationId: 'not-an-id', name: 'MP-1' }).success).toBe(false);
	});
});

describe('listLocations — the venue tree the schedule screens navigate', () => {
	it('returns each location with its courts, both ordered by name', async () => {
		const calls: unknown[] = [];
		const db = fakeDb({
			calls,
			tables: {
				locations: { data: [{ id: LOC, name: 'Murdock Park', address: null, active: true }] },
				courts: {
					data: [
						{ id: 'c1', location_id: LOC, name: 'MP-1', active: true },
						{ id: 'c2', location_id: 'other', name: 'DA-1', active: true }
					]
				}
			}
		});
		const result = await listLocations(db);
		expect(result.ok).toBe(true);
		if (!result.ok) return;
		expect(result.value).toHaveLength(1);
		expect(result.value[0].courts.map((c) => c.name)).toEqual(['MP-1']);
		expect(called(calls, 'order', 'name')).toBe(true);
	});

	it('reports a failed read rather than an empty academy', async () => {
		const db = fakeDb({ tables: { locations: { error: { message: 'boom', code: '42501' } } } });
		const result = await listLocations(db);
		expect(result.ok).toBe(false);
		if (result.ok) return;
		expect(result.error.code).toBe('not_authorized');
	});
});

describe('writes — a duplicate name is a conflict, not a crash', () => {
	it('creates a location and returns its id', async () => {
		const db = fakeDb({ tables: { locations: { data: { id: LOC } } } });
		const result = await createLocation(db, { name: 'De Anza College', address: '' });
		expect(result).toEqual({ ok: true, value: { id: LOC } });
	});

	it('maps a duplicate court name on a location to conflict', async () => {
		const db = fakeDb({
			tables: { courts: { error: { message: 'duplicate key', code: '23505' } } }
		});
		const result = await createCourt(db, { locationId: LOC, name: 'MP-1' });
		expect(result.ok).toBe(false);
		if (result.ok) return;
		expect(result.error.code).toBe('conflict');
	});

	it('deactivating is an update, never a delete — history keeps its court', async () => {
		const calls: unknown[] = [];
		const db = fakeDb({ calls, tables: { courts: {} } });
		const result = await updateCourt(db, 'c1', { active: false });
		expect(result.ok).toBe(true);
		expect(called(calls, 'update', { active: false })).toBe(true);
		expect(called(calls, 'delete')).toBe(false);
	});

	it('renames a location without touching its other columns', async () => {
		const calls: unknown[] = [];
		const db = fakeDb({ calls, tables: { locations: {} } });
		await updateLocation(db, LOC, { name: 'Murdock Park' });
		expect(called(calls, 'update', { name: 'Murdock Park' })).toBe(true);
		expect(called(calls, 'eq', 'id', LOC)).toBe(true);
	});
});
