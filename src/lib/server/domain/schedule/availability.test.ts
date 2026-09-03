import { describe, expect, it } from 'vitest';
import {
	addException,
	addWindow,
	endWindow,
	exceptionSchema,
	listExceptions,
	listWindows,
	windowSchema
} from './availability';
import { called, fakeDb } from './fakes';

const COURT = '22222222-2222-2222-2222-222222222222';
const base = {
	courtId: COURT,
	weekday: 6,
	openLocal: '09:00',
	closeLocal: '13:00',
	effectiveFrom: '2026-09-07',
	effectiveTo: '',
	lessonBookable: true,
	slotMinutes: 60,
	reservationRef: 'PERMIT-4471'
};

describe('windowSchema — a reservation the academy actually holds', () => {
	it('accepts a well-formed window and defaults the open-ended end date', () => {
		const parsed = windowSchema.parse(base);
		expect(parsed.effectiveTo).toBe('');
		expect(parsed.weekday).toBe(6);
	});
	it('refuses a close at or before the open', () => {
		expect(windowSchema.safeParse({ ...base, closeLocal: '09:00' }).success).toBe(false);
		expect(windowSchema.safeParse({ ...base, closeLocal: '08:00' }).success).toBe(false);
	});
	it('refuses a weekday outside ISO 1–7 and an off-scale slot length', () => {
		expect(windowSchema.safeParse({ ...base, weekday: 0 }).success).toBe(false);
		expect(windowSchema.safeParse({ ...base, weekday: 8 }).success).toBe(false);
		expect(windowSchema.safeParse({ ...base, slotMinutes: 50 }).success).toBe(false);
	});
	it('refuses an end date before the start date', () => {
		expect(windowSchema.safeParse({ ...base, effectiveTo: '2026-09-06' }).success).toBe(false);
		expect(windowSchema.safeParse({ ...base, effectiveTo: '2026-12-13' }).success).toBe(true);
	});
	it('treats the venue reference as optional — some courts are held informally', () => {
		expect(windowSchema.safeParse({ ...base, reservationRef: '' }).success).toBe(true);
	});
});

describe('exceptionSchema — a closure or an extra opening on one date', () => {
	const exc = { courtId: COURT, onDate: '2026-11-26', kind: 'closed', reason: 'Venue event' };
	it('a closure may name no times at all — that means the whole day', () => {
		const parsed = exceptionSchema.parse({ ...exc, openLocal: '', closeLocal: '' });
		expect(parsed.openLocal).toBe('');
	});
	it('an extra opening must say when it opens and closes', () => {
		expect(
			exceptionSchema.safeParse({ ...exc, kind: 'open', openLocal: '', closeLocal: '' }).success
		).toBe(false);
		expect(
			exceptionSchema.safeParse({ ...exc, kind: 'open', openLocal: '14:00', closeLocal: '16:00' })
				.success
		).toBe(true);
	});
	it('refuses a window that closes before it opens, whichever kind', () => {
		expect(
			exceptionSchema.safeParse({ ...exc, kind: 'open', openLocal: '16:00', closeLocal: '14:00' })
				.success
		).toBe(false);
	});
});

describe('reads', () => {
	it('lists a court windows newest-effective first, in the shape the table renders', async () => {
		const calls: unknown[] = [];
		const db = fakeDb({
			calls,
			tables: {
				court_availability: {
					data: [
						{
							id: 'w1',
							court_id: COURT,
							weekday: 6,
							open_local: '09:00:00',
							close_local: '13:00:00',
							effective_from: '2026-09-07',
							effective_to: null,
							lesson_bookable: false,
							slot_minutes: 60,
							reservation_ref: 'PERMIT-4471'
						}
					]
				}
			}
		});
		const result = await listWindows(db, COURT);
		expect(result.ok).toBe(true);
		if (!result.ok) return;
		expect(result.value[0]).toMatchObject({
			id: 'w1',
			weekday: 6,
			openLocal: '09:00',
			closeLocal: '13:00',
			effectiveTo: null,
			lessonBookable: false,
			reservationRef: 'PERMIT-4471'
		});
		expect(called(calls, 'eq', 'court_id', COURT)).toBe(true);
	});

	it('lists exceptions for a court by date', async () => {
		const calls: unknown[] = [];
		const db = fakeDb({ calls, tables: { court_availability_exceptions: { data: [] } } });
		const result = await listExceptions(db, COURT);
		expect(result.ok).toBe(true);
		expect(called(calls, 'eq', 'court_id', COURT)).toBe(true);
		expect(called(calls, 'order', 'on_date')).toBe(true);
	});
});

describe('writes — the database protects the sessions already scheduled', () => {
	it('adds a window as the row Postgres expects, open-ended when no end date is given', async () => {
		const calls: unknown[] = [];
		const db = fakeDb({ calls, tables: { court_availability: { data: { id: 'w1' } } } });
		const result = await addWindow(db, base);
		expect(result).toEqual({ ok: true, value: { id: 'w1' } });
		expect(
			called(calls, 'insert', {
				court_id: COURT,
				weekday: 6,
				open_local: '09:00',
				close_local: '13:00',
				effective_from: '2026-09-07',
				effective_to: null,
				lesson_bookable: true,
				slot_minutes: 60,
				reservation_ref: 'PERMIT-4471'
			})
		).toBe(true);
	});

	it('ending a window sets effective_to; it never deletes the reservation history', async () => {
		const calls: unknown[] = [];
		const db = fakeDb({ calls, tables: { court_availability: {} } });
		const result = await endWindow(db, 'w1', '2026-10-31');
		expect(result.ok).toBe(true);
		expect(called(calls, 'update', { effective_to: '2026-10-31' })).toBe(true);
		expect(called(calls, 'delete')).toBe(false);
	});

	it('shrinking availability under a scheduled session is refused in the caller words', async () => {
		const db = fakeDb({
			tables: {
				court_availability: {
					error: {
						message: 'availability_in_use: session 9d3 (…) would lose its court; cancel it first',
						code: '23514'
					}
				}
			}
		});
		const result = await endWindow(db, 'w1', '2026-10-31');
		expect(result.ok).toBe(false);
		if (result.ok) return;
		expect(result.error.code).toBe('availability_in_use');
	});

	it('a closure that would strand a session is refused the same way', async () => {
		const db = fakeDb({
			tables: {
				court_availability_exceptions: {
					error: { message: 'availability_in_use: session 9d3 …', code: '23514' }
				}
			}
		});
		const result = await addException(db, {
			courtId: COURT,
			onDate: '2026-11-26',
			kind: 'closed',
			openLocal: '',
			closeLocal: '',
			reason: 'Rain'
		});
		expect(result.ok).toBe(false);
		if (result.ok) return;
		expect(result.error.code).toBe('availability_in_use');
	});

	it('a whole-day closure sends null times, not empty strings', async () => {
		const calls: unknown[] = [];
		const db = fakeDb({ calls, tables: { court_availability_exceptions: { data: { id: 'e1' } } } });
		await addException(db, {
			courtId: COURT,
			onDate: '2026-11-26',
			kind: 'closed',
			openLocal: '',
			closeLocal: '',
			reason: ''
		});
		expect(
			called(calls, 'insert', {
				court_id: COURT,
				on_date: '2026-11-26',
				kind: 'closed',
				open_local: null,
				close_local: null,
				reason: null
			})
		).toBe(true);
	});
});
