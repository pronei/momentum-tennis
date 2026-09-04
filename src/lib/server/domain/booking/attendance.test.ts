import { describe, expect, it } from 'vitest';
import { called, fakeDb } from '../schedule/fakes';
import { mark, roster, settle } from './attendance';
import { promote, waitlistPosition } from './waitlist';

const SESSION = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
const PLAYER = '11111111-1111-1111-1111-111111111111';
const COACH = '99999999-9999-9999-9999-999999999999';

describe('roster — who is expected, and what has been marked', () => {
	it('merges the bookings with any attendance already recorded, unmarked as null', async () => {
		const calls: unknown[] = [];
		const db = fakeDb({
			calls,
			tables: {
				class_bookings: {
					data: [
						{ id: 'b2', player_id: 'p2', status: 'booked', players: { full_name: 'Zoe R.' } },
						{ id: 'b1', player_id: PLAYER, status: 'booked', players: { full_name: 'Ana W.' } }
					]
				},
				session_attendance: { data: [{ player_id: PLAYER, present: true }] }
			}
		});
		const result = await roster(db, SESSION);
		expect(result.ok).toBe(true);
		if (!result.ok) return;
		expect(result.value.map((r) => r.fullName)).toEqual(['Ana W.', 'Zoe R.']);
		expect(result.value[0].present).toBe(true);
		expect(result.value[1].present).toBeNull();
		expect(called(calls, 'eq', 'class_session_id', SESSION)).toBe(true);
	});
});

describe('mark — the row records who said so', () => {
	it('upserts with marked_by, which the insert policy requires to be the caller', async () => {
		const calls: unknown[] = [];
		const db = fakeDb({ calls, tables: { session_attendance: {} } });
		const result = await mark(db, {
			sessionId: SESSION,
			playerId: PLAYER,
			present: false,
			markedBy: COACH
		});
		expect(result.ok).toBe(true);
		const upsert = calls.find((c) => Array.isArray(c) && c[0] === 'upsert') as [
			string,
			Record<string, unknown>
		];
		expect(upsert[1]).toMatchObject({
			session_id: SESSION,
			player_id: PLAYER,
			present: false,
			marked_by: COACH
		});
	});

	it('a non-staff caller is refused by the policy, not by this code', async () => {
		const db = fakeDb({
			tables: { session_attendance: { error: { message: 'denied', code: '42501' } } }
		});
		const result = await mark(db, {
			sessionId: SESSION,
			playerId: PLAYER,
			present: true,
			markedBy: COACH
		});
		expect(result.ok).toBe(false);
		if (result.ok) return;
		expect(result.error.code).toBe('not_authorized');
	});
});

describe('settle and the waitlist', () => {
	it('settle reports how many bookings it closed', async () => {
		const db = fakeDb({ rpc: { data: 4 } });
		expect(await settle(db)).toEqual({ ok: true, value: { settled: 4 } });
	});

	it('waitlistPosition returns a rank, or null when the player is not waiting', async () => {
		const calls: unknown[] = [];
		expect(
			await waitlistPosition(fakeDb({ calls, rpc: { data: 2 } }), {
				sessionId: SESSION,
				playerId: PLAYER
			})
		).toEqual({ ok: true, value: 2 });
		expect(
			await waitlistPosition(fakeDb({ rpc: { data: null } }), {
				sessionId: SESSION,
				playerId: PLAYER
			})
		).toEqual({ ok: true, value: null });
		expect(
			called(calls, 'rpc', 'waitlist_position', { p_session: SESSION, p_player: PLAYER })
		).toBe(true);
	});

	it('promote is the staff override and maps its refusal', async () => {
		const db = fakeDb({ rpc: { error: { message: 'staff_only' } } });
		const result = await promote(db, SESSION);
		expect(result.ok).toBe(false);
		if (result.ok) return;
		expect(result.error.code).toBe('staff_only');
	});
});
