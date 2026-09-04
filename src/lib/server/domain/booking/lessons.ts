import { z } from 'zod';
import { err, fromPostgres, ok, type Result } from '$lib/server/domain/result';
import { localInstant } from '$lib/server/domain/time';
import { localDate, localTime, uuid } from '../schedule/common';
import type { BookingDb } from './index';

// Private lessons. `book_private_lesson` is the whole rule: the coach must hold the coach role, the
// time must sit inside a lesson-bookable window (court_available with p_for_lessons), the player
// must be waivered and hold a private_lesson credit, and the court and coach EXCLUDE constraints
// arbitrate the clash. This module converts a wall clock and translates a refusal.
//
// It deliberately does NOT enumerate bookable slots. Expanding windows into candidate times in
// TypeScript would be a second, weaker copy of court_available() — and one that goes stale the
// moment an exception is added. The family is shown the windows; the database decides the slot.

export const LESSON_MINUTES = [30, 60, 90, 120] as const;

export const lessonSchema = z.object({
	playerId: uuid,
	coachId: uuid,
	courtId: uuid,
	date: localDate,
	start: localTime,
	minutes: z.coerce
		.number()
		.int()
		.refine((v) => (LESSON_MINUTES as readonly number[]).includes(v), 'Pick a lesson length')
		.default(60),
	credits: z.coerce.number().int().min(1, 'At least one').max(4, 'Too many').default(1)
});
export type LessonInput = z.infer<typeof lessonSchema>;

export type LessonWindow = {
	id: string;
	courtId: string;
	courtName: string;
	locationName: string;
	weekday: number;
	openLocal: string;
	closeLocal: string;
	slotMinutes: number;
};

type WindowRow = {
	id: string;
	court_id: string;
	weekday: number;
	open_local: string;
	close_local: string;
	slot_minutes: number;
	courts: { name: string; locations: { name: string } | null } | null;
};

/** The windows in which the academy offers lessons at all — what the family picks a time inside. */
export async function listLessonWindows(db: BookingDb): Promise<Result<LessonWindow[]>> {
	const { data, error } = await db
		.from('court_availability')
		.select(
			'id, court_id, weekday, open_local, close_local, slot_minutes, courts ( name, locations ( name ) )'
		)
		.eq('lesson_bookable', true)
		.order('weekday')
		.order('open_local');
	if (error) return err(fromPostgres(error));
	return ok(
		((data ?? []) as unknown as WindowRow[]).map((w) => ({
			id: w.id,
			courtId: w.court_id,
			courtName: w.courts?.name ?? '',
			locationName: w.courts?.locations?.name ?? '',
			weekday: w.weekday,
			openLocal: w.open_local.slice(0, 5),
			closeLocal: w.close_local.slice(0, 5),
			slotMinutes: w.slot_minutes
		}))
	);
}

export async function bookLesson(
	db: BookingDb,
	input: LessonInput,
	tz: string
): Promise<Result<{ sessionId: string }>> {
	const startsAt = localInstant(input.date, input.start, tz);
	const endsAt = new Date(new Date(startsAt).getTime() + input.minutes * 60_000).toISOString();
	const { data, error } = await db.rpc('book_private_lesson', {
		p_player: input.playerId,
		p_coach: input.coachId,
		p_court: input.courtId,
		p_starts: startsAt,
		p_ends: endsAt,
		p_credits: input.credits
	});
	if (error) return err(fromPostgres(error));
	return ok({ sessionId: data as string });
}

/** Cancelling a lesson also cancels its session, which is what frees the court and the coach. */
export async function cancelLesson(
	db: BookingDb,
	sessionId: string
): Promise<Result<{ status: string; forgiven: boolean }>> {
	const { data, error } = await db.rpc('cancel_booking', { p_kind: 'lesson', p_id: sessionId });
	if (error) return err(fromPostgres(error));
	const out = data as { status: string; forgiven: boolean };
	return ok({ status: out.status, forgiven: out.forgiven });
}
