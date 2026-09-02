import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '$lib/server/db/database.types';
import { err, fromPostgres, ok, type Result } from '$lib/server/domain/result';

/** The only surface this module needs — injected, so it is testable without a database. */
export type BookingDb = Pick<SupabaseClient<Database>, 'rpc'>;

export type BookingStatus = Database['public']['Enums']['booking_status'];

/**
 * Book one class occurrence with a scoped credit. The database enforces the waiver gate,
 * credits, the weekly cap, capacity (→ waitlist) and level tags atomically — this wrapper
 * only names the arguments and translates a refusal.
 */
export async function bookClass(
	db: BookingDb,
	input: { playerId: string; sessionId: string }
): Promise<Result<{ bookingId: string }>> {
	const { data, error } = await db.rpc('book_class', {
		p_player: input.playerId,
		p_session: input.sessionId
	});
	if (error) return err(fromPostgres(error));
	return ok({ bookingId: data as string });
}

/** Cancel a class booking or a private lesson. Policy (notice window, forgiveness) is in SQL. */
export async function cancelBooking(
	db: BookingDb,
	input: { kind: 'class' | 'lesson'; id: string }
): Promise<Result<{ status: BookingStatus; forgiven: boolean }>> {
	const { data, error } = await db.rpc('cancel_booking', { p_kind: input.kind, p_id: input.id });
	if (error) return err(fromPostgres(error));
	const out = data as { status: BookingStatus; forgiven: boolean };
	return ok({ status: out.status, forgiven: out.forgiven });
}
