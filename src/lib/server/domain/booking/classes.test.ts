import { describe, expect, it } from 'vitest';
import { called, fakeDb } from '../schedule/fakes';
import { cancellationNotice, cancelClass, listBookable, listBookings } from './classes';

const LA = 'America/Los_Angeles';
const PLAYER = '11111111-1111-1111-1111-111111111111';
const S1 = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
const S2 = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';

const view = (id: string, startsAt: string, levelKeys: string[] = []) => ({
	id,
	session_type: 'class',
	starts_at: startsAt,
	ends_at: startsAt,
	status: 'scheduled',
	notes: null,
	venue_note: null,
	court_id: 'c1',
	court_name: 'MP-1',
	location_id: 'loc1',
	location_name: 'Murdock Park',
	coach_id: null,
	coach_name: null,
	title: 'Green Monday',
	parent_id: 'cl1',
	level_keys: levelKeys
});

// 2026-09-14 is a Monday; 2026-09-19 is the Saturday of the same ISO week.
const MON = '2026-09-14T23:00:00Z'; // 16:00 PDT Monday
const SAT = '2026-09-19T16:00:00Z'; // 09:00 PDT Saturday

describe('listBookable — what this player could actually take', () => {
	const db = (over: Record<string, unknown> = {}) =>
		fakeDb({
			tables: {
				v_schedule_sessions: { data: [view(S1, MON), view(S2, SAT)] },
				v_class_session_seats: {
					data: [
						{ session_id: S1, capacity: 6, booked: 4, waitlisted: 0, seats_left: 2 },
						{ session_id: S2, capacity: 6, booked: 6, waitlisted: 2, seats_left: 0 }
					]
				},
				class_bookings: { data: [] },
				...over
			}
		});

	it('carries the seat count and the scope for each session', async () => {
		const result = await listBookable(db(), {
			playerId: PLAYER,
			levelKey: null,
			from: '2026-09-14',
			days: 14,
			tz: LA
		});
		expect(result.ok).toBe(true);
		if (!result.ok) return;
		expect(result.value[0]).toMatchObject({
			id: S1,
			seatsLeft: 2,
			waitlisted: 0,
			scope: 'weekday',
			alreadyBooked: false,
			weekBlocked: false
		});
		expect(result.value[1]).toMatchObject({ id: S2, seatsLeft: 0, waitlisted: 2, scope: 'weekend' });
	});

	it('applies the level rule the booking trigger applies, and no other', async () => {
		const tagged = fakeDb({
			tables: {
				v_schedule_sessions: { data: [view(S1, MON, ['orange']), view(S2, SAT)] },
				v_class_session_seats: { data: [] },
				class_bookings: { data: [] }
			}
		});
		const none = await listBookable(tagged, {
			playerId: PLAYER,
			levelKey: null,
			from: '2026-09-14',
			days: 14,
			tz: LA
		});
		if (!none.ok) throw new Error('expected ok');
		expect(none.value.map((s) => s.id)).toEqual([S2]); // untagged only
		const orange = await listBookable(tagged, {
			playerId: PLAYER,
			levelKey: 'orange',
			from: '2026-09-14',
			days: 14,
			tz: LA
		});
		if (!orange.ok) throw new Error('expected ok');
		expect(orange.value.map((s) => s.id)).toEqual([S1, S2]);
	});

	it('marks the session this player already holds', async () => {
		const result = await listBookable(
			db({ class_bookings: { data: [{ class_session_id: S1, status: 'booked' }] } }),
			{ playerId: PLAYER, levelKey: null, from: '2026-09-14', days: 14, tz: LA }
		);
		if (!result.ok) throw new Error('expected ok');
		expect(result.value[0].alreadyBooked).toBe(true);
	});

	it('marks the weekly cap: one booked weekday class blocks the rest of that ISO week', async () => {
		// a booked weekday class on the Monday blocks the Tuesday, not the Saturday
		const result = await listBookable(
			db({
				class_bookings: {
					data: [{ class_session_id: 'other', status: 'booked', scope: 'weekday', week_start: '2026-09-14' }]
				}
			}),
			{ playerId: PLAYER, levelKey: null, from: '2026-09-14', days: 14, tz: LA }
		);
		if (!result.ok) throw new Error('expected ok');
		expect(result.value[0].weekBlocked).toBe(true); // Monday, weekday scope, same week
		expect(result.value[1].weekBlocked).toBe(false); // Saturday is the weekend scope
	});

	it('asks the view only for scheduled classes inside the window', async () => {
		const calls: unknown[] = [];
		const spy = fakeDb({
			calls,
			tables: {
				v_schedule_sessions: { data: [] },
				v_class_session_seats: { data: [] },
				class_bookings: { data: [] }
			}
		});
		await listBookable(spy, {
			playerId: PLAYER,
			levelKey: null,
			from: '2026-09-14',
			days: 7,
			tz: LA
		});
		expect(called(calls, 'eq', 'session_type', 'class')).toBe(true);
		expect(called(calls, 'eq', 'status', 'scheduled')).toBe(true);
		expect(called(calls, 'gte', 'starts_at', '2026-09-14T07:00:00.000Z')).toBe(true);
		expect(called(calls, 'lt', 'starts_at', '2026-09-21T07:00:00.000Z')).toBe(true);
	});
});

describe('cancellationNotice — the rule stated before the guardian confirms', () => {
	const start = new Date('2026-09-14T23:00:00Z');
	it('is free at exactly the notice window, mirroring >= in SQL', () => {
		const exactly = new Date(start.getTime() - 24 * 3_600_000);
		expect(cancellationNotice(start.toISOString(), 24, exactly)).toBe('free');
	});
	it('is late one minute inside it', () => {
		const inside = new Date(start.getTime() - 24 * 3_600_000 + 60_000);
		expect(cancellationNotice(start.toISOString(), 24, inside)).toBe('late');
	});
	it('is free well before', () => {
		expect(cancellationNotice(start.toISOString(), 24, new Date('2026-09-01T00:00:00Z'))).toBe(
			'free'
		);
	});
});

describe('listBookings and cancelClass', () => {
	it('splits upcoming from past on the session start', async () => {
		const db = fakeDb({
			tables: {
				class_bookings: {
					data: [
						{
							id: 'b1',
							status: 'booked',
							class_session_id: S1,
							sessions: { id: S1, starts_at: '2099-01-01T00:00:00Z', ends_at: '2099-01-01T01:00:00Z', status: 'scheduled' },
							class_sessions: null
						}
					]
				}
			}
		});
		const result = await listBookings(db, { playerId: PLAYER });
		expect(result.ok).toBe(true);
		if (!result.ok) return;
		expect(result.value.upcoming).toHaveLength(1);
		expect(result.value.past).toHaveLength(0);
	});

	it('cancelling reports the status, the forgiveness and who it promoted', async () => {
		const calls: unknown[] = [];
		const db = fakeDb({ calls, rpc: { data: { status: 'cancelled', forgiven: false, promoted: 1 } } });
		const result = await cancelClass(db, 'b1');
		expect(result).toEqual({
			ok: true,
			value: { status: 'cancelled', forgiven: false, promoted: 1 }
		});
		expect(called(calls, 'rpc', 'cancel_booking', { p_kind: 'class', p_id: 'b1' })).toBe(true);
	});

	it('maps a refusal to book', async () => {
		const db = fakeDb({ rpc: { error: { message: 'weekly_cap: one weekday class per week' } } });
		const result = await cancelClass(db, 'b1');
		expect(result.ok).toBe(false);
		if (result.ok) return;
		expect(result.error.code).toBe('weekly_cap');
	});
});
