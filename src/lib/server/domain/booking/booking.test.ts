import { describe, expect, it } from 'vitest';
import { bookClass, cancelBooking, type BookingDb } from './index';

// A fake with the exact surface the module uses (rpc). No mocks of behavior we don't own.
function fakeDb(
	handler: (
		fn: string,
		args: Record<string, unknown>
	) => { data?: unknown; error?: { message: string; code?: string } | null }
): BookingDb {
	return {
		rpc: (fn: string, args: Record<string, unknown>) =>
			Promise.resolve({ data: null, error: null, ...handler(fn, args) })
	} as unknown as BookingDb;
}

describe('bookClass — a thin, typed wrapper over the book_class RPC', () => {
	it('passes the player and session to the RPC and returns the booking id', async () => {
		const calls: unknown[] = [];
		const db = fakeDb((fn, args) => {
			calls.push([fn, args]);
			return { data: 'b-1' };
		});
		const r = await bookClass(db, { playerId: 'p-1', sessionId: 's-1' });
		expect(calls).toEqual([['book_class', { p_player: 'p-1', p_session: 's-1' }]]);
		expect(r).toEqual({ ok: true, value: { bookingId: 'b-1' } });
	});

	it('translates a database refusal into a typed AppError', async () => {
		const db = fakeDb(() => ({ error: { message: 'weekly_cap: one weekday class per week' } }));
		const r = await bookClass(db, { playerId: 'p-1', sessionId: 's-1' });
		expect(r.ok).toBe(false);
		if (!r.ok) expect(r.error.code).toBe('weekly_cap');
	});
});

describe('cancelBooking', () => {
	it('returns the resulting status and whether the skip was forgiven', async () => {
		const db = fakeDb(() => ({ data: { status: 'cancelled_late', forgiven: true } }));
		const r = await cancelBooking(db, { kind: 'class', id: 'b-1' });
		expect(r).toEqual({ ok: true, value: { status: 'cancelled_late', forgiven: true } });
	});
	it('maps not_cancellable', async () => {
		const db = fakeDb(() => ({ error: { message: 'not_cancellable: completed' } }));
		const r = await cancelBooking(db, { kind: 'lesson', id: 's-9' });
		if (r.ok) throw new Error('expected err');
		expect(r.error.code).toBe('not_cancellable');
		expect(r.error.detail).toBe('completed');
	});
});
