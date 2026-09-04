import { describe, expect, it } from 'vitest';
import { called, fakeDb } from '../schedule/fakes';
import { bookLesson, cancelLesson, lessonSchema, listLessonWindows } from './lessons';

const LA = 'America/Los_Angeles';
const PLAYER = '11111111-1111-1111-1111-111111111111';
const COACH = '99999999-9999-9999-9999-999999999999';
const COURT = '22222222-2222-2222-2222-222222222222';

describe('listLessonWindows — when the academy offers private lessons at all', () => {
	it('returns only lesson-bookable windows, with their court and venue', async () => {
		const calls: unknown[] = [];
		const db = fakeDb({
			calls,
			tables: {
				court_availability: {
					data: [
						{
							id: 'w1',
							court_id: COURT,
							weekday: 1,
							open_local: '16:00:00',
							close_local: '20:00:00',
							slot_minutes: 60,
							courts: { name: 'MP-1', locations: { name: 'Murdock Park' } }
						}
					]
				}
			}
		});
		const result = await listLessonWindows(db);
		expect(result.ok).toBe(true);
		if (!result.ok) return;
		expect(result.value[0]).toEqual({
			id: 'w1',
			courtId: COURT,
			courtName: 'MP-1',
			locationName: 'Murdock Park',
			weekday: 1,
			openLocal: '16:00',
			closeLocal: '20:00',
			slotMinutes: 60
		});
		expect(called(calls, 'eq', 'lesson_bookable', true)).toBe(true);
	});
});

describe('lessonSchema', () => {
	const base = {
		playerId: PLAYER,
		coachId: COACH,
		courtId: COURT,
		date: '2026-09-14',
		start: '16:00',
		minutes: 60
	};
	it('accepts a well-formed request', () => {
		expect(lessonSchema.safeParse(base).success).toBe(true);
	});
	it('holds the lesson lengths the academy offers', () => {
		expect(lessonSchema.safeParse({ ...base, minutes: 30 }).success).toBe(true);
		expect(lessonSchema.safeParse({ ...base, minutes: 45 }).success).toBe(false);
	});
	it('needs a player, a coach and a court — a lesson is all three', () => {
		expect(lessonSchema.safeParse({ ...base, coachId: '' }).success).toBe(false);
		expect(lessonSchema.safeParse({ ...base, courtId: '' }).success).toBe(false);
	});
});

describe('bookLesson — the database decides whether the slot exists', () => {
	it('converts the wall clock with the academy timezone and passes both ends', async () => {
		const calls: unknown[] = [];
		const db = fakeDb({ calls, rpc: { data: 'session-1' } });
		const result = await bookLesson(
			db,
			{
				playerId: PLAYER,
				coachId: COACH,
				courtId: COURT,
				date: '2026-09-14',
				start: '16:00',
				minutes: 60,
				credits: 1
			},
			LA
		);
		expect(result).toEqual({ ok: true, value: { sessionId: 'session-1' } });
		expect(
			called(calls, 'rpc', 'book_private_lesson', {
				p_player: PLAYER,
				p_coach: COACH,
				p_court: COURT,
				p_starts: '2026-09-14T23:00:00.000Z',
				p_ends: '2026-09-15T00:00:00.000Z',
				p_credits: 1
			})
		).toBe(true);
	});

	it('maps every refusal the RPC can raise', async () => {
		for (const [message, code] of [
			['slot_not_bookable', 'slot_not_bookable'],
			['not_a_coach', 'not_a_coach'],
			['slot_taken', 'slot_taken'],
			['insufficient_credits: private_lesson', 'insufficient_credits'],
			['waiver_required', 'waiver_required']
		] as const) {
			const db = fakeDb({ rpc: { error: { message } } });
			const result = await bookLesson(
				db,
				{
					playerId: PLAYER,
					coachId: COACH,
					courtId: COURT,
					date: '2026-09-14',
					start: '16:00',
					minutes: 60,
					credits: 1
				},
				LA
			);
			expect(result.ok).toBe(false);
			if (!result.ok) expect(result.error.code).toBe(code);
		}
	});

	it('cancelling a lesson frees the court and the coach', async () => {
		const calls: unknown[] = [];
		const db = fakeDb({ calls, rpc: { data: { status: 'cancelled', forgiven: false } } });
		const result = await cancelLesson(db, 'session-1');
		expect(result.ok).toBe(true);
		expect(called(calls, 'rpc', 'cancel_booking', { p_kind: 'lesson', p_id: 'session-1' })).toBe(
			true
		);
	});
});
