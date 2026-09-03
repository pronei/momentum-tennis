import { describe, expect, it } from 'vitest';
import { called, fakeDb } from './fakes';
import {
	cancelSession,
	createSession,
	filterForPlayer,
	getSession,
	listDay,
	listRange,
	sessionSchema,
	setSessionLevels,
	updateSession
} from './sessions';

const LA = 'America/Los_Angeles';
const COURT = '22222222-2222-2222-2222-222222222222';
const LOC = '11111111-1111-1111-1111-111111111111';
const CLASS = '44444444-4444-4444-4444-444444444444';
const TEAM = '55555555-5555-5555-5555-555555555555';
const SESSION = '66666666-6666-6666-6666-666666666666';

const draft = {
	type: 'class' as const,
	parentId: CLASS,
	courtId: COURT,
	coachId: '',
	date: '2026-09-12',
	start: '09:00',
	end: '11:00',
	kind: 'practice' as const,
	opponent: '',
	homeAway: '' as const,
	notes: '',
	venueNote: ''
};

describe('sessionSchema — what may be scheduled, and where', () => {
	it('accepts a class on a court', () => {
		expect(sessionSchema.safeParse(draft).success).toBe(true);
	});
	it('refuses an end at or before the start', () => {
		expect(sessionSchema.safeParse({ ...draft, end: '09:00' }).success).toBe(false);
	});
	it('requires a parent for everything but a private session', () => {
		expect(sessionSchema.safeParse({ ...draft, parentId: '' }).success).toBe(false);
		expect(sessionSchema.safeParse({ ...draft, type: 'private', parentId: '' }).success).toBe(true);
	});
	it('requires a court for a class, a camp and a private session', () => {
		expect(sessionSchema.safeParse({ ...draft, courtId: '' }).success).toBe(false);
		expect(
			sessionSchema.safeParse({ ...draft, type: 'private', parentId: '', courtId: '' }).success
		).toBe(false);
	});
	it('lets only a team AWAY match have no court', () => {
		const team = { ...draft, type: 'team' as const, parentId: TEAM, courtId: '' };
		expect(sessionSchema.safeParse({ ...team, kind: 'practice' }).success).toBe(false);
		expect(
			sessionSchema.safeParse({ ...team, kind: 'match', opponent: 'Bay Club', homeAway: 'home' })
				.success
		).toBe(false);
		expect(
			sessionSchema.safeParse({ ...team, kind: 'match', opponent: 'Bay Club', homeAway: 'away' })
				.success
		).toBe(true);
	});
	it('a match names its opponent and says home or away', () => {
		const team = { ...draft, type: 'team' as const, parentId: TEAM, kind: 'match' as const };
		expect(sessionSchema.safeParse(team).success).toBe(false);
		expect(
			sessionSchema.safeParse({ ...team, opponent: 'Bay Club', homeAway: 'home' }).success
		).toBe(true);
	});
});

describe('listDay — one location, one academy-local day', () => {
	it('queries the view across the local day and orders by start', async () => {
		const calls: unknown[] = [];
		const db = fakeDb({ calls, tables: { v_schedule_sessions: { data: [] } } });
		const result = await listDay(db, { locationId: LOC, localDate: '2026-09-12', tz: LA });
		expect(result.ok).toBe(true);
		expect(called(calls, 'from', 'v_schedule_sessions')).toBe(true);
		expect(called(calls, 'gte', 'starts_at', '2026-09-12T07:00:00.000Z')).toBe(true);
		expect(called(calls, 'lt', 'starts_at', '2026-09-13T07:00:00.000Z')).toBe(true);
		expect(called(calls, 'eq', 'location_id', LOC)).toBe(true);
		expect(called(calls, 'order', 'starts_at')).toBe(true);
	});

	it('maps a view row into the shape the grid renders', async () => {
		const db = fakeDb({
			tables: {
				v_schedule_sessions: {
					data: [
						{
							id: SESSION,
							session_type: 'class',
							starts_at: '2026-09-12T16:00:00Z',
							ends_at: '2026-09-12T18:00:00Z',
							status: 'scheduled',
							notes: null,
							venue_note: null,
							court_id: COURT,
							court_name: 'MP-1',
							location_id: LOC,
							location_name: 'Murdock Park',
							coach_id: null,
							coach_name: null,
							title: 'Green Saturday',
							parent_id: CLASS,
							level_keys: ['green_beginner']
						}
					]
				}
			}
		});
		const result = await listDay(db, { locationId: LOC, localDate: '2026-09-12', tz: LA });
		expect(result.ok).toBe(true);
		if (!result.ok) return;
		expect(result.value[0]).toMatchObject({
			id: SESSION,
			type: 'class',
			title: 'Green Saturday',
			courtName: 'MP-1',
			levelKeys: ['green_beginner'],
			cancelled: false
		});
	});
});

describe('listRange — the next N days, for the portal and the public page', () => {
	it('spans whole local days and asks only for scheduled sessions', async () => {
		const calls: unknown[] = [];
		const db = fakeDb({ calls, tables: { v_schedule_sessions: { data: [] } } });
		await listRange(db, { from: '2026-09-12', days: 14, tz: LA });
		expect(called(calls, 'gte', 'starts_at', '2026-09-12T07:00:00.000Z')).toBe(true);
		expect(called(calls, 'lt', 'starts_at', '2026-09-26T07:00:00.000Z')).toBe(true);
		expect(called(calls, 'eq', 'status', 'scheduled')).toBe(true);
	});
});

describe('filterForPlayer — mirrors enforce_class_booking, so the list cannot lie', () => {
	const s = (levelKeys: string[]) => ({ levelKeys }) as { levelKeys: string[] };
	it('an untagged session is open to everyone, level or not', () => {
		expect(filterForPlayer([s([])], 'orange')).toHaveLength(1);
		expect(filterForPlayer([s([])], null)).toHaveLength(1);
	});
	it('a tagged session needs the player level among its tags', () => {
		expect(filterForPlayer([s(['orange'])], 'orange')).toHaveLength(1);
		expect(filterForPlayer([s(['orange'])], 'green_beginner')).toHaveLength(0);
	});
	it('a player without a level sees only untagged sessions', () => {
		expect(filterForPlayer([s(['orange']), s([])], null)).toHaveLength(1);
	});
});

describe('createSession — the session row, then its subtype row', () => {
	it('converts the local wall clock with the academy timezone', async () => {
		const calls: unknown[] = [];
		const db = fakeDb({
			calls,
			tables: { sessions: { data: { id: SESSION } }, class_sessions: {} }
		});
		const result = await createSession(db, draft, LA);
		expect(result).toEqual({ ok: true, value: { id: SESSION } });
		expect(
			called(calls, 'insert', {
				session_type: 'class',
				starts_at: '2026-09-12T16:00:00.000Z',
				ends_at: '2026-09-12T18:00:00.000Z',
				court_id: COURT,
				coach_id: null,
				notes: null,
				venue_note: null
			})
		).toBe(true);
		expect(called(calls, 'insert', { session_id: SESSION, class_id: CLASS })).toBe(true);
	});

	it('writes the team subtype with its match detail', async () => {
		const calls: unknown[] = [];
		const db = fakeDb({
			calls,
			tables: { sessions: { data: { id: SESSION } }, team_sessions: {} }
		});
		await createSession(
			db,
			{
				...draft,
				type: 'team',
				parentId: TEAM,
				courtId: '',
				kind: 'match',
				opponent: 'Bay Club',
				homeAway: 'away'
			},
			LA
		);
		expect(
			called(calls, 'insert', {
				session_id: SESSION,
				team_id: TEAM,
				kind: 'match',
				opponent: 'Bay Club',
				home_away: 'away'
			})
		).toBe(true);
	});

	it('writes no subtype row for a private session', async () => {
		const calls: unknown[] = [];
		const db = fakeDb({ calls, tables: { sessions: { data: { id: SESSION } } } });
		const result = await createSession(db, { ...draft, type: 'private', parentId: '' }, LA);
		expect(result.ok).toBe(true);
		expect(called(calls, 'from', 'class_sessions')).toBe(false);
	});

	it('maps the court EXCLUDE constraint to slot_taken', async () => {
		const db = fakeDb({
			tables: { sessions: { error: { message: 'conflicting key value', code: '23P01' } } }
		});
		const result = await createSession(db, draft, LA);
		expect(result.ok).toBe(false);
		if (result.ok) return;
		expect(result.error.code).toBe('slot_taken');
	});

	it('maps a session outside declared availability to court_unavailable', async () => {
		const db = fakeDb({
			tables: {
				sessions: {
					error: { message: 'court_unavailable: court 22 is not reserved for …', code: '23514' }
				}
			}
		});
		const result = await createSession(db, draft, LA);
		expect(result.ok).toBe(false);
		if (result.ok) return;
		expect(result.error.code).toBe('court_unavailable');
	});

	it('removes the session row when its subtype row cannot be written', async () => {
		const calls: unknown[] = [];
		const db = fakeDb({
			calls,
			tables: {
				sessions: { data: { id: SESSION } },
				class_sessions: { error: { message: 'insert or update violates foreign key' } }
			}
		});
		const result = await createSession(db, draft, LA);
		expect(result.ok).toBe(false);
		// no orphan: a session with no parent would render as an untitled block forever
		expect(called(calls, 'delete')).toBe(true);
		expect(called(calls, 'eq', 'id', SESSION)).toBe(true);
	});
});

describe('updateSession, tagging and cancellation', () => {
	it('moves a session and re-converts both ends', async () => {
		const calls: unknown[] = [];
		const db = fakeDb({ calls, tables: { sessions: {} } });
		const result = await updateSession(db, SESSION, { ...draft, start: '11:00', end: '13:00' }, LA);
		expect(result.ok).toBe(true);
		expect(
			called(calls, 'update', {
				starts_at: '2026-09-12T18:00:00.000Z',
				ends_at: '2026-09-12T20:00:00.000Z',
				court_id: COURT,
				coach_id: null,
				notes: null,
				venue_note: null
			})
		).toBe(true);
	});

	it('replaces the tag set through the RPC', async () => {
		const calls: unknown[] = [];
		const db = fakeDb({ calls, rpc: { data: 1 } });
		expect(await setSessionLevels(db, SESSION, ['orange'])).toEqual({
			ok: true,
			value: { tagged: 1 }
		});
		expect(
			called(calls, 'rpc', 'set_session_levels', { p_session: SESSION, p_level_keys: ['orange'] })
		).toBe(true);
	});

	it('cancelling reports how many players the academy made whole', async () => {
		const calls: unknown[] = [];
		const db = fakeDb({ calls, rpc: { data: 3 } });
		expect(await cancelSession(db, SESSION, 'Rained out')).toEqual({
			ok: true,
			value: { madeWhole: 3 }
		});
		expect(
			called(calls, 'rpc', 'cancel_session', { p_session: SESSION, p_reason: 'Rained out' })
		).toBe(true);
	});
});

describe('getSession — one occurrence, for the edit screen', () => {
	it('reads the same view the grid does, so the two cannot disagree', async () => {
		const calls: unknown[] = [];
		const db = fakeDb({ calls, tables: { v_schedule_sessions: { data: null } } });
		const result = await getSession(db, SESSION);
		expect(result).toEqual({ ok: true, value: null });
		expect(called(calls, 'from', 'v_schedule_sessions')).toBe(true);
		expect(called(calls, 'eq', 'id', SESSION)).toBe(true);
	});
});

describe('sessionSchema and superforms', () => {
	it('superValidate can build a form from it — the reason it is flat, not a union', async () => {
		const { superValidate } = await import('sveltekit-superforms');
		const { zod4 } = await import('sveltekit-superforms/adapters');
		const form = await superValidate({ type: 'class', date: '2026-09-12' }, zod4(sessionSchema));
		expect(form.data.type).toBe('class');
		expect(form.data.date).toBe('2026-09-12');
		// defaults exist for every field, so the form renders before anything is typed
		expect(form.data.kind).toBe('practice');
		expect(form.data.notes).toBe('');
	});

	it('reports a refusal against the field it belongs to', async () => {
		const { superValidate } = await import('sveltekit-superforms');
		const { zod4 } = await import('sveltekit-superforms/adapters');
		const form = await superValidate(
			{
				type: 'class',
				parentId: CLASS,
				courtId: COURT,
				date: '2026-09-12',
				start: '11:00',
				end: '09:00'
			},
			zod4(sessionSchema)
		);
		expect(form.valid).toBe(false);
		expect(form.errors.end?.[0]).toBe('End after the start');
	});
});
