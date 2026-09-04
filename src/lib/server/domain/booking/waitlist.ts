import { err, fromPostgres, ok, type Result } from '$lib/server/domain/result';
import type { BookingDb } from './index';

// K: a waitlisted player holds neither a credit nor a weekly-cap slot. Promotion re-checks both,
// and since 0008 a cancellation promotes on the spot — so this module is the family's view of the
// queue plus the staff override, not the mechanism.

/**
 * Where this player stands, 1-based, or null when they are not waiting. Counting the rows ahead
 * means reading other families' bookings, which RLS forbids, so the database answers with a rank
 * through `waitlist_position` and discloses nothing else.
 */
export async function waitlistPosition(
	db: BookingDb,
	opts: { sessionId: string; playerId: string }
): Promise<Result<number | null>> {
	const { data, error } = await db.rpc('waitlist_position', {
		p_session: opts.sessionId,
		p_player: opts.playerId
	});
	if (error) return err(fromPostgres(error));
	return ok((data as number | null) ?? null);
}

/** Staff override. Ordinary promotion happens inside `cancel_booking`; this is for a manual seat. */
export async function promote(
	db: BookingDb,
	sessionId: string
): Promise<Result<{ promoted: number }>> {
	const { data, error } = await db.rpc('promote_waitlist', { p_session: sessionId });
	if (error) return err(fromPostgres(error));
	return ok({ promoted: (data as number) ?? 0 });
}
