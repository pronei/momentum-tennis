import type { Database } from '$lib/server/db/database.types';
import { err, fromPostgres, ok, type Result } from '$lib/server/domain/result';
import { filterForPlayer, type ScheduleSession } from '../schedule/sessions';
import { dayBounds, isoWeekStart, scopeOf } from '$lib/server/domain/time';
import type { BookingDb } from './index';

// What a family may book, and what they hold. Every rule that decides is in the database:
// book_class checks the waiver gate, the credit, the weekly cap, capacity and the level tags, all
// inside one transaction. This module asks the same questions only to EXPLAIN — so a family is
// told "this week already has a weekday class" instead of being refused after pressing Book.
// Where the two could ever disagree, the database wins and the refusal copy is what shows.

export type CreditScope = Database['public']['Enums']['credit_scope'];

export type BookableSession = ScheduleSession & {
	scope: CreditScope;
	seatsLeft: number;
	waitlisted: number;
	alreadyBooked: boolean;
	weekBlocked: boolean;
};

type SeatRow = {
	session_id: string;
	capacity: number;
	booked: number;
	waitlisted: number;
	seats_left: number;
};
type HeldRow = {
	class_session_id: string;
	status: Database['public']['Enums']['booking_status'];
	scope?: CreditScope;
	week_start?: string;
};

const VIEW_SELECT =
	'id, session_type, starts_at, ends_at, status, notes, venue_note, court_id, court_name, location_id, location_name, coach_id, coach_name, title, parent_id, level_keys';

/**
 * The class occurrences this player could take, from `from` for `days` days. The caller passes a
 * window already clamped to `booking_horizon_days` — the horizon is academy policy, read from
 * `academy_settings`, never a constant here.
 */
export async function listBookable(
	db: BookingDb,
	opts: { playerId: string; levelKey: string | null; from: string; days: number; tz: string }
): Promise<Result<BookableSession[]>> {
	const [y, m, d] = opts.from.split('-').map(Number);
	const until = new Date(Date.UTC(y, m - 1, d + opts.days)).toISOString().slice(0, 10);
	const { data, error } = await db
		.from('v_schedule_sessions')
		.select(VIEW_SELECT)
		.eq('session_type', 'class')
		.eq('status', 'scheduled')
		.gte('starts_at', dayBounds(opts.from, opts.tz).startsAt)
		.lt('starts_at', dayBounds(until, opts.tz).startsAt)
		.order('starts_at');
	if (error) return err(fromPostgres(error));

	const sessions = ((data ?? []) as unknown as Record<string, unknown>[]).map((r) => ({
		id: r.id as string,
		type: r.session_type as ScheduleSession['type'],
		startsAt: r.starts_at as string,
		endsAt: r.ends_at as string,
		cancelled: r.status === 'cancelled',
		title: (r.title as string) ?? 'Class',
		notes: (r.notes as string) ?? null,
		venueNote: (r.venue_note as string) ?? null,
		courtId: (r.court_id as string) ?? null,
		courtName: (r.court_name as string) ?? null,
		locationId: (r.location_id as string) ?? null,
		locationName: (r.location_name as string) ?? null,
		coachId: (r.coach_id as string) ?? null,
		coachName: (r.coach_name as string) ?? null,
		parentId: (r.parent_id as string) ?? null,
		levelKeys: (r.level_keys as string[]) ?? []
	}));

	// N: exactly the rule enforce_class_booking applies — reused, not restated.
	const visible = filterForPlayer(sessions, opts.levelKey);

	const { data: seatRows, error: seatError } = await db
		.from('v_class_session_seats')
		.select('session_id, capacity, booked, waitlisted, seats_left')
		.in(
			'session_id',
			visible.map((s) => s.id)
		);
	if (seatError) return err(fromPostgres(seatError));
	const seats = new Map(((seatRows ?? []) as unknown as SeatRow[]).map((r) => [r.session_id, r]));

	// The player's own bookings: readable because the caller guards them. `scope` and `week_start`
	// are derived by the class_bookings trigger in academy time, so comparing against them is
	// comparing against what uq_one_class_per_scope_week actually indexes.
	const { data: heldRows, error: heldError } = await db
		.from('class_bookings')
		.select('class_session_id, status, scope, week_start')
		.eq('player_id', opts.playerId)
		.in('status', ['booked', 'waitlisted']);
	if (heldError) return err(fromPostgres(heldError));
	const held = (heldRows ?? []) as unknown as HeldRow[];
	const heldSessions = new Set(held.map((h) => h.class_session_id));
	const bookedWeeks = new Set(
		held
			.filter((h) => h.status === 'booked' && h.scope && h.week_start)
			.map((h) => `${h.scope}:${h.week_start}`)
	);

	return ok(
		visible.map((s) => {
			const seat = seats.get(s.id);
			const scope = scopeOf(s.startsAt, opts.tz);
			return {
				...s,
				scope,
				seatsLeft: seat?.seats_left ?? 0,
				waitlisted: seat?.waitlisted ?? 0,
				alreadyBooked: heldSessions.has(s.id),
				weekBlocked:
					!heldSessions.has(s.id) &&
					bookedWeeks.has(`${scope}:${isoWeekStart(s.startsAt, opts.tz)}`)
			};
		})
	);
}

export type PlayerBooking = {
	id: string;
	sessionId: string;
	status: Database['public']['Enums']['booking_status'];
	startsAt: string;
	endsAt: string;
	sessionCancelled: boolean;
};

type BookingRow = {
	id: string;
	status: PlayerBooking['status'];
	class_session_id: string;
	sessions: { id: string; starts_at: string; ends_at: string; status: string } | null;
};

/** What this player holds, split on whether the session has started. */
export async function listBookings(
	db: BookingDb,
	opts: { playerId: string; now?: Date }
): Promise<Result<{ upcoming: PlayerBooking[]; past: PlayerBooking[] }>> {
	const { data, error } = await db
		.from('class_bookings')
		.select(
			'id, status, class_session_id, sessions:class_session_id ( id, starts_at, ends_at, status )'
		)
		.eq('player_id', opts.playerId)
		.order('created_at', { ascending: false });
	if (error) return err(fromPostgres(error));
	const now = (opts.now ?? new Date()).toISOString();
	const rows = ((data ?? []) as unknown as BookingRow[])
		.filter((r) => r.sessions !== null)
		.map((r) => ({
			id: r.id,
			sessionId: r.class_session_id,
			status: r.status,
			startsAt: r.sessions!.starts_at,
			endsAt: r.sessions!.ends_at,
			sessionCancelled: r.sessions!.status === 'cancelled'
		}))
		.sort((a, b) => a.startsAt.localeCompare(b.startsAt));
	return ok({
		upcoming: rows.filter((r) => r.startsAt >= now),
		past: rows.filter((r) => r.startsAt < now)
	});
}

/**
 * Whether cancelling now returns the credit. Mirrors `cancel_booking`'s `>=` exactly — at the
 * boundary the credit still comes back — so the sentence shown before the confirm is the one the
 * database will act on.
 */
export function cancellationNotice(
	startsAt: string,
	noticeHours: number,
	now: Date = new Date()
): 'free' | 'late' {
	const lead = new Date(startsAt).getTime() - now.getTime();
	return lead >= noticeHours * 3_600_000 ? 'free' : 'late';
}

export async function cancelClass(
	db: BookingDb,
	bookingId: string
): Promise<Result<{ status: PlayerBooking['status']; forgiven: boolean; promoted: number }>> {
	const { data, error } = await db.rpc('cancel_booking', { p_kind: 'class', p_id: bookingId });
	if (error) return err(fromPostgres(error));
	const out = data as { status: PlayerBooking['status']; forgiven: boolean; promoted?: number };
	return ok({ status: out.status, forgiven: out.forgiven, promoted: out.promoted ?? 0 });
}
