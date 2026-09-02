// The database refuses; we translate. Every domain function returns a Result so routes never
// branch on raw Postgres messages, and the UI copy for a refusal lives in exactly one place.

const CODES = [
	'not_authenticated',
	'not_authorized',
	'validation',
	'waiver_required',
	'weekly_cap',
	'insufficient_credits',
	'level_required',
	'level_mismatch',
	'already_booked',
	'class_full',
	'slot_taken',
	'slot_not_bookable',
	'court_unavailable',
	'session_not_bookable',
	'beyond_booking_horizon',
	'not_cancellable',
	'unknown_session',
	'unknown_booking',
	'conflict',
	'unexpected'
] as const;

export type ErrorCode = (typeof CODES)[number];

export class AppError extends Error {
	static readonly codes = CODES;
	constructor(
		readonly code: ErrorCode,
		readonly detail?: string
	) {
		super(detail ? `${code}: ${detail}` : code);
		this.name = 'AppError';
	}
}

export type Result<T, E = AppError> = { ok: true; value: T } | { ok: false; error: E };
export const ok = <T>(value: T): Result<T, never> => ({ ok: true, value });
export const err = <E>(error: E): Result<never, E> => ({ ok: false, error });
export const isErr = <T, E>(r: Result<T, E>): r is { ok: false; error: E } => !r.ok;

type PgLike = { message?: string; code?: string; details?: string };
const isCode = (s: string): s is ErrorCode => (CODES as readonly string[]).includes(s);

/** Postgres SQLSTATE / PostgREST codes that carry meaning on their own. */
const BY_SQLSTATE: Record<string, ErrorCode> = {
	'23P01': 'slot_taken', // exclusion constraint — a court or coach is already booked
	'42501': 'not_authorized', // RLS / privilege
	'23505': 'conflict', // unique violation not already translated by an RPC
	PGRST301: 'not_authenticated' // JWT expired
};

export function fromPostgres(e: PgLike | null | undefined): AppError {
	const message = e?.message ?? '';
	if (e?.code && BY_SQLSTATE[e.code]) return new AppError(BY_SQLSTATE[e.code], message);
	// RPCs raise `token` or `token: detail` — the token is the contract
	const m = /^([a-z_]+)(?::\s*(.*))?$/s.exec(message.trim());
	if (m && isCode(m[1])) return new AppError(m[1], m[2]?.trim() || undefined);
	return new AppError('unexpected', message || undefined);
}

/** Plain, earned, disciplined. The UI sets these in mono caps; no exclamation points ever. */
const COPY: Record<ErrorCode, string> = {
	not_authenticated: 'Sign in to continue.',
	not_authorized: 'This account cannot act for that player.',
	validation: 'Check the highlighted fields.',
	waiver_required: 'A current waiver must be signed for this player before booking.',
	weekly_cap: 'One weekday or weekend class per week per package. This week already has one.',
	insufficient_credits: 'No valid credits for this class type. Buy a package to continue.',
	level_required: 'Set the player ball level before booking a level-tagged slot.',
	level_mismatch: 'This slot does not offer the player ball level.',
	already_booked: 'This player is already booked or waitlisted for that session.',
	class_full: 'This class is full.',
	slot_taken: 'That court or coach is already booked at this time.',
	slot_not_bookable: 'Private lessons are not offered in that window.',
	court_unavailable: 'The court is not reserved for that time.',
	session_not_bookable: 'This session can no longer be booked.',
	beyond_booking_horizon: 'That date is beyond the booking window.',
	not_cancellable: 'This booking can no longer be cancelled.',
	unknown_session: 'That session does not exist.',
	unknown_booking: 'That booking does not exist.',
	conflict: 'Something changed while you were working. Reload and try again.',
	unexpected: 'Something went wrong on our side. Nothing was charged or booked.'
};

export const describeError = (code: ErrorCode): string => COPY[code];
