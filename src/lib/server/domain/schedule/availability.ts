import { z } from 'zod';
import { err, fromPostgres, ok, type Result } from '$lib/server/domain/result';
import { isoWeekday, localDate, localTime, type ScheduleDb, SLOT_MINUTES, uuid } from './common';

// Decision H: Artur reserves a court with the venue first, then declares it here. Recurring
// weekly windows plus dated exceptions are the whole truth about when a court exists, and the
// database refuses both a session outside a window and a window shrunk under a live session.
// Nothing in this module re-checks that — it would only be a second, weaker opinion.

const timeRange = <T extends { openLocal: string; closeLocal: string }>(v: T) =>
	v.closeLocal > v.openLocal;

export const windowSchema = z
	.object({
		courtId: uuid,
		weekday: isoWeekday,
		openLocal: localTime,
		closeLocal: localTime,
		effectiveFrom: localDate,
		// '' = open-ended. A window usually outlives the term it was declared for.
		effectiveTo: z.union([localDate, z.literal('')]).default(''),
		lessonBookable: z.boolean().default(true),
		// stays `number`: the check constraint in 0001 is the authority, this is the friendly refusal
		slotMinutes: z.coerce
			.number()
			.int()
			.refine((v) => (SLOT_MINUTES as readonly number[]).includes(v), 'Pick a slot length')
			.default(60),
		reservationRef: z.string().trim().max(120, 'Too long').default('')
	})
	.refine(timeRange, { path: ['closeLocal'], message: 'Close must be after open' })
	.refine((v) => v.effectiveTo === '' || v.effectiveTo >= v.effectiveFrom, {
		path: ['effectiveTo'],
		message: 'End on or after the start'
	});
export type WindowInput = z.infer<typeof windowSchema>;

export const exceptionSchema = z
	.object({
		courtId: uuid,
		onDate: localDate,
		kind: z.enum(['closed', 'open']),
		// A closure with no times closes the whole day; an extra opening must say when.
		openLocal: z.union([localTime, z.literal('')]).default(''),
		closeLocal: z.union([localTime, z.literal('')]).default(''),
		reason: z.string().trim().max(240, 'Too long').default('')
	})
	.refine((v) => v.kind !== 'open' || (v.openLocal !== '' && v.closeLocal !== ''), {
		path: ['openLocal'],
		message: 'An extra opening needs both times'
	})
	.refine((v) => v.openLocal === '' || v.closeLocal === '' || timeRange(v), {
		path: ['closeLocal'],
		message: 'Close must be after open'
	});
export type ExceptionInput = z.infer<typeof exceptionSchema>;

export type Window = {
	id: string;
	courtId: string;
	weekday: number;
	openLocal: string;
	closeLocal: string;
	effectiveFrom: string;
	effectiveTo: string | null;
	lessonBookable: boolean;
	slotMinutes: number;
	reservationRef: string | null;
};
export type AvailabilityException = {
	id: string;
	courtId: string;
	onDate: string;
	kind: 'closed' | 'open';
	openLocal: string | null;
	closeLocal: string | null;
	reason: string | null;
};

type WindowRow = {
	id: string;
	court_id: string;
	weekday: number;
	open_local: string;
	close_local: string;
	effective_from: string;
	effective_to: string | null;
	lesson_bookable: boolean;
	slot_minutes: number;
	reservation_ref: string | null;
};
type ExceptionRow = {
	id: string;
	court_id: string;
	on_date: string;
	kind: 'closed' | 'open';
	open_local: string | null;
	close_local: string | null;
	reason: string | null;
};

/** Postgres `time` comes back as HH:MM:SS; every screen shows HH:MM. */
const hhmm = (t: string | null): string | null => (t === null ? null : t.slice(0, 5));

export async function listWindows(db: ScheduleDb, courtId: string): Promise<Result<Window[]>> {
	const { data, error } = await db
		.from('court_availability')
		.select(
			'id, court_id, weekday, open_local, close_local, effective_from, effective_to, lesson_bookable, slot_minutes, reservation_ref'
		)
		.eq('court_id', courtId)
		.order('weekday')
		.order('open_local');
	if (error) return err(fromPostgres(error));
	return ok(
		((data ?? []) as unknown as WindowRow[]).map((w) => ({
			id: w.id,
			courtId: w.court_id,
			weekday: w.weekday,
			openLocal: hhmm(w.open_local)!,
			closeLocal: hhmm(w.close_local)!,
			effectiveFrom: w.effective_from,
			effectiveTo: w.effective_to,
			lessonBookable: w.lesson_bookable,
			slotMinutes: w.slot_minutes,
			reservationRef: w.reservation_ref
		}))
	);
}

export async function listExceptions(
	db: ScheduleDb,
	courtId: string
): Promise<Result<AvailabilityException[]>> {
	const { data, error } = await db
		.from('court_availability_exceptions')
		.select('id, court_id, on_date, kind, open_local, close_local, reason')
		.eq('court_id', courtId)
		.order('on_date');
	if (error) return err(fromPostgres(error));
	return ok(
		((data ?? []) as unknown as ExceptionRow[]).map((e) => ({
			id: e.id,
			courtId: e.court_id,
			onDate: e.on_date,
			kind: e.kind,
			openLocal: hhmm(e.open_local),
			closeLocal: hhmm(e.close_local),
			reason: e.reason
		}))
	);
}

export async function addWindow(
	db: ScheduleDb,
	input: WindowInput
): Promise<Result<{ id: string }>> {
	const { data, error } = await db
		.from('court_availability')
		.insert({
			court_id: input.courtId,
			weekday: input.weekday,
			open_local: input.openLocal,
			close_local: input.closeLocal,
			effective_from: input.effectiveFrom,
			effective_to: input.effectiveTo || null,
			lesson_bookable: input.lessonBookable,
			slot_minutes: input.slotMinutes,
			reservation_ref: input.reservationRef || null
		})
		.select('id')
		.single();
	if (error) return err(fromPostgres(error));
	return ok({ id: (data as { id: string }).id });
}

/**
 * Stop a recurring window from a date. Never a delete: the reservation is a record of what the
 * academy held, and `availability_protects_sessions` refuses this outright while a scheduled
 * session still falls inside it — which arrives here as `availability_in_use`.
 */
export async function endWindow(db: ScheduleDb, id: string, on: string): Promise<Result<null>> {
	const { error } = await db.from('court_availability').update({ effective_to: on }).eq('id', id);
	if (error) return err(fromPostgres(error));
	return ok(null);
}

export async function addException(
	db: ScheduleDb,
	input: ExceptionInput
): Promise<Result<{ id: string }>> {
	const { data, error } = await db
		.from('court_availability_exceptions')
		.insert({
			court_id: input.courtId,
			on_date: input.onDate,
			kind: input.kind,
			open_local: input.openLocal || null,
			close_local: input.closeLocal || null,
			reason: input.reason || null
		})
		.select('id')
		.single();
	if (error) return err(fromPostgres(error));
	return ok({ id: (data as { id: string }).id });
}

/** An exception is a correction, so removing one is legitimate — the trigger still guards it. */
export async function deleteException(db: ScheduleDb, id: string): Promise<Result<null>> {
	const { error } = await db.from('court_availability_exceptions').delete().eq('id', id);
	if (error) return err(fromPostgres(error));
	return ok(null);
}
