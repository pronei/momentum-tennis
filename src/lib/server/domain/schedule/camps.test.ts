import { describe, expect, it } from 'vitest';
import { addCampDay, campSchema, createCamp, listCampDays, listCamps } from './camps';
import { called, fakeDb } from './fakes';

const LA = 'America/Los_Angeles';
const CAMP = '77777777-7777-7777-7777-777777777777';
const COURT = '22222222-2222-2222-2222-222222222222';

describe('campSchema — a dated event with seats', () => {
	const base = {
		name: 'Week 1',
		startsOn: '2027-06-14',
		endsOn: '2027-06-18',
		capacity: 24,
		description: ''
	};
	it('accepts a camp week', () => {
		expect(campSchema.safeParse(base).success).toBe(true);
	});
	it('allows a single-day camp but not one that ends before it starts', () => {
		expect(campSchema.safeParse({ ...base, endsOn: '2027-06-14' }).success).toBe(true);
		expect(campSchema.safeParse({ ...base, endsOn: '2027-06-13' }).success).toBe(false);
	});
	it('needs at least one seat', () => {
		expect(campSchema.safeParse({ ...base, capacity: 0 }).success).toBe(false);
	});
});

describe('camps', () => {
	it('lists camps by start date', async () => {
		const calls: unknown[] = [];
		const db = fakeDb({ calls, tables: { camps: { data: [] } } });
		expect((await listCamps(db)).ok).toBe(true);
		expect(called(calls, 'order', 'starts_on')).toBe(true);
	});

	it('maps the summer-window trigger to camp_out_of_season', async () => {
		const db = fakeDb({
			tables: {
				camps: {
					error: {
						message: 'camp_out_of_season: camps must fall within the configured summer window',
						code: '23514'
					}
				}
			}
		});
		const result = await createCamp(db, {
			name: 'Week 1',
			startsOn: '2027-01-05',
			endsOn: '2027-01-09',
			capacity: 24,
			description: ''
		});
		expect(result.ok).toBe(false);
		if (result.ok) return;
		expect(result.error.code).toBe('camp_out_of_season');
	});

	it('a camp day is a camp session, written through the one session writer', async () => {
		const calls: unknown[] = [];
		const db = fakeDb({ calls, tables: { sessions: { data: { id: 's1' } }, camp_sessions: {} } });
		const result = await addCampDay(
			db,
			CAMP,
			{ date: '2027-06-15', start: '09:00', end: '15:00', courtId: COURT, coachId: '' },
			LA
		);
		expect(result).toEqual({ ok: true, value: { id: 's1' } });
		expect(called(calls, 'insert', { session_id: 's1', camp_id: CAMP })).toBe(true);
	});

	it('lists a camp days from the schedule view', async () => {
		const calls: unknown[] = [];
		const db = fakeDb({ calls, tables: { v_schedule_sessions: { data: [] } } });
		expect((await listCampDays(db, CAMP)).ok).toBe(true);
		expect(called(calls, 'eq', 'parent_id', CAMP)).toBe(true);
		expect(called(calls, 'eq', 'session_type', 'camp')).toBe(true);
	});
});
