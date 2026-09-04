import type { Database } from '$lib/server/db/database.types';
import { err, fromPostgres, ok, type Result } from '$lib/server/domain/result';
import type { BookingDb } from './index';

// Attendance is what settlement reads: finalize_bookings turns an absence into a no_show and asks
// apply_forgiveness whether this package's one forgiven skip is still available. Marking is a
// direct table write — session_attendance has real insert and update policies for staff, and the
// insert policy requires marked_by = auth.uid(), so the row records who said so.

export type RosterEntry = {
	playerId: string;
	fullName: string;
	bookingId: string;
	status: Database['public']['Enums']['booking_status'];
	present: boolean | null;
};

type RosterRow = {
	id: string;
	player_id: string;
	status: RosterEntry['status'];
	players: { full_name: string } | null;
};
type AttendanceRow = { player_id: string; present: boolean };

/** Who is expected, and what has been marked so far. Staff-only in practice — RLS decides. */
export async function roster(db: BookingDb, sessionId: string): Promise<Result<RosterEntry[]>> {
	const { data, error } = await db
		.from('class_bookings')
		.select('id, player_id, status, players ( full_name )')
		.eq('class_session_id', sessionId)
		.in('status', ['booked', 'completed', 'no_show']);
	if (error) return err(fromPostgres(error));
	const { data: marks, error: markError } = await db
		.from('session_attendance')
		.select('player_id, present')
		.eq('session_id', sessionId);
	if (markError) return err(fromPostgres(markError));
	const marked = new Map(
		((marks ?? []) as unknown as AttendanceRow[]).map((m) => [m.player_id, m.present])
	);
	return ok(
		((data ?? []) as unknown as RosterRow[])
			.map((r) => ({
				playerId: r.player_id,
				fullName: r.players?.full_name ?? '',
				bookingId: r.id,
				status: r.status,
				present: marked.get(r.player_id) ?? null
			}))
			.sort((a, b) => a.fullName.localeCompare(b.fullName))
	);
}

/** Correctable by design: a coach marking the wrong row must be able to fix it, and the audit
 *  trigger on session_attendance keeps both statements. */
export async function mark(
	db: BookingDb,
	input: { sessionId: string; playerId: string; present: boolean; markedBy: string }
): Promise<Result<null>> {
	const { error } = await db.from('session_attendance').upsert({
		session_id: input.sessionId,
		player_id: input.playerId,
		present: input.present,
		marked_by: input.markedBy,
		updated_at: new Date().toISOString()
	});
	if (error) return err(fromPostgres(error));
	return ok(null);
}

/**
 * Settle everything that has ended: present or unmarked becomes `completed`, absent becomes
 * `no_show` and asks forgiveness. Cron owns this from phase 7; staff may run it now.
 */
export async function settle(
	db: BookingDb,
	endedBefore?: string
): Promise<Result<{ settled: number }>> {
	const { data, error } = await db.rpc('finalize_bookings', {
		p_ended_before: endedBefore ?? undefined
	});
	if (error) return err(fromPostgres(error));
	return ok({ settled: (data as number) ?? 0 });
}
