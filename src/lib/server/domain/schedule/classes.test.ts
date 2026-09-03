import { describe, expect, it } from 'vitest';
import {
	classSchema,
	createClass,
	createTerm,
	generateOccurrences,
	listClasses,
	listTerms,
	setClassLevels,
	termSchema,
	updateClass
} from './classes';
import { called, fakeDb } from './fakes';

const TERM = '33333333-3333-3333-3333-333333333333';
const COURT = '22222222-2222-2222-2222-222222222222';
const CLASS = '44444444-4444-4444-4444-444444444444';
const template = {
	termId: TERM,
	name: 'Green Saturday',
	weekday: 6,
	startTimeLocal: '09:00',
	durationMinutes: 120,
	capacity: 6,
	defaultCourtId: COURT,
	defaultCoachId: ''
};

describe('termSchema — a season with a start and an end', () => {
	it('accepts a term and refuses one that ends before it starts', () => {
		expect(
			termSchema.safeParse({ name: 'Fall 2026', startsOn: '2026-09-07', endsOn: '2026-12-13' })
				.success
		).toBe(true);
		expect(
			termSchema.safeParse({ name: 'Fall 2026', startsOn: '2026-12-13', endsOn: '2026-09-07' })
				.success
		).toBe(false);
		expect(
			termSchema.safeParse({ name: 'Fall 2026', startsOn: '2026-09-07', endsOn: '2026-09-07' })
				.success
		).toBe(false);
	});
});

describe('classSchema — the weekly template, in wall-clock time', () => {
	it('accepts a well-formed template', () => {
		expect(classSchema.parse(template).startTimeLocal).toBe('09:00');
	});
	it('holds the class shape: 90 or 120 minutes, ISO weekday, at least one seat', () => {
		expect(classSchema.safeParse({ ...template, durationMinutes: 60 }).success).toBe(false);
		expect(classSchema.safeParse({ ...template, durationMinutes: 90 }).success).toBe(true);
		expect(classSchema.safeParse({ ...template, weekday: 0 }).success).toBe(false);
		expect(classSchema.safeParse({ ...template, capacity: 0 }).success).toBe(false);
	});
	it('lets a template carry no default court or coach yet', () => {
		expect(classSchema.safeParse({ ...template, defaultCourtId: '' }).success).toBe(true);
	});
});

describe('reads', () => {
	it('lists terms by start date', async () => {
		const calls: unknown[] = [];
		const db = fakeDb({ calls, tables: { terms: { data: [] } } });
		expect((await listTerms(db)).ok).toBe(true);
		expect(called(calls, 'order', 'starts_on')).toBe(true);
	});

	it('lists a term classes with their level tags flattened to keys', async () => {
		const db = fakeDb({
			tables: {
				classes: {
					data: [
						{
							id: CLASS,
							term_id: TERM,
							name: 'Green Saturday',
							weekday: 6,
							start_time_local: '09:00:00',
							duration_minutes: 120,
							capacity: 6,
							default_court_id: COURT,
							default_coach_id: null,
							courts: { name: 'MP-1' },
							accounts: null,
							class_skill_levels: [
								{ skill_levels: { key: 'green_advanced', rank: 4 } },
								{ skill_levels: { key: 'green_beginner', rank: 2 } }
							]
						}
					]
				}
			}
		});
		const result = await listClasses(db, TERM);
		expect(result.ok).toBe(true);
		if (!result.ok) return;
		expect(result.value[0]).toMatchObject({
			id: CLASS,
			name: 'Green Saturday',
			startTimeLocal: '09:00',
			courtName: 'MP-1',
			coachName: null
		});
		// ranked, so the portal and the admin table order levels the same way
		expect(result.value[0].levelKeys).toEqual(['green_beginner', 'green_advanced']);
	});
});

describe('writes', () => {
	it('creates a template, sending null for an unset court or coach', async () => {
		const calls: unknown[] = [];
		const db = fakeDb({ calls, tables: { classes: { data: { id: CLASS } } } });
		const result = await createClass(db, template);
		expect(result).toEqual({ ok: true, value: { id: CLASS } });
		expect(
			called(calls, 'insert', {
				term_id: TERM,
				name: 'Green Saturday',
				weekday: 6,
				start_time_local: '09:00',
				duration_minutes: 120,
				capacity: 6,
				default_court_id: COURT,
				default_coach_id: null
			})
		).toBe(true);
	});

	it('updates a template without moving it to another term', async () => {
		const calls: unknown[] = [];
		const db = fakeDb({ calls, tables: { classes: {} } });
		await updateClass(db, CLASS, template);
		const update = calls.find((c) => Array.isArray(c) && c[0] === 'update') as [string, object];
		expect(update[1]).not.toHaveProperty('term_id');
		expect(called(calls, 'eq', 'id', CLASS)).toBe(true);
	});

	it('tags a template through the RPC, so the set is replaced in one act', async () => {
		const calls: unknown[] = [];
		const db = fakeDb({ calls, rpc: { data: 2 } });
		const result = await setClassLevels(db, CLASS, ['orange', 'green_beginner']);
		expect(result).toEqual({ ok: true, value: { tagged: 2 } });
		expect(
			called(calls, 'rpc', 'set_class_levels', {
				p_class: CLASS,
				p_level_keys: ['orange', 'green_beginner']
			})
		).toBe(true);
	});

	it('maps an unknown level key to its own refusal', async () => {
		const db = fakeDb({
			rpc: { error: { message: 'unknown_skill_level: {purple}', code: '23514' } }
		});
		const result = await setClassLevels(db, CLASS, ['purple']);
		expect(result.ok).toBe(false);
		if (result.ok) return;
		expect(result.error.code).toBe('unknown_skill_level');
	});

	it('generates occurrences and reports the dates it had to skip', async () => {
		const calls: unknown[] = [];
		const db = fakeDb({ calls, rpc: { data: { created: 12, skipped: ['2026-11-28'] } } });
		const result = await generateOccurrences(db, CLASS, '2026-09-07', '2026-12-13');
		expect(result).toEqual({ ok: true, value: { created: 12, skipped: ['2026-11-28'] } });
		expect(
			called(calls, 'rpc', 'generate_class_sessions', {
				p_class: CLASS,
				p_from: '2026-09-07',
				p_to: '2026-12-13'
			})
		).toBe(true);
	});

	it('reads a generation that created nothing as an empty result, not a failure', async () => {
		const db = fakeDb({ rpc: { data: { created: 0, skipped: [] } } });
		expect(await generateOccurrences(db, CLASS, '2026-09-07', '2026-09-07')).toEqual({
			ok: true,
			value: { created: 0, skipped: [] }
		});
	});

	it('maps an unknown class to its own refusal', async () => {
		const db = fakeDb({ rpc: { error: { message: 'unknown_class', code: '23514' } } });
		const result = await generateOccurrences(db, CLASS, '2026-09-07', '2026-12-13');
		expect(result.ok).toBe(false);
		if (result.ok) return;
		expect(result.error.code).toBe('unknown_class');
	});

	it('creates a term', async () => {
		const db = fakeDb({ tables: { terms: { data: { id: TERM } } } });
		expect(
			await createTerm(db, { name: 'Fall 2026', startsOn: '2026-09-07', endsOn: '2026-12-13' })
		).toEqual({ ok: true, value: { id: TERM } });
	});
});
