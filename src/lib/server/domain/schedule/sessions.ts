import { z } from 'zod';
import type { Database } from '$lib/server/db/database.types';
import { AppError, err, fromPostgres, ok, type Result } from '$lib/server/domain/result';
import { dayBounds, localInstant } from '$lib/server/domain/time';
import { localDate, localTime, type ScheduleDb, uuid } from './common';

// Sessions are the calendar's atoms: a class occurrence, a camp day, a team practice or match,
// a blocked private slot. Every rule that matters is already in the database — the availability
// gate, the court and coach EXCLUDE constraints, the audit trigger — so this module converts
// wall-clock input to instants, writes the subtype row, and translates refusals.

export type SessionType = Database['public']['Enums']['session_type'];
export const SESSION_TYPES = ['class', 'camp', 'team', 'private'] as const;

/**
 * One flat schema rather than a discriminated union: superforms needs a single object shape to
 * hold defaults and errors for the whole form, and the type-specific rules read perfectly well
 * as refinements. Court-less is allowed for exactly one thing — a team away match.
 */
export const sessionSchema = z
	.object({
		type: z.enum(SESSION_TYPES),
		parentId: z.union([uuid, z.literal('')]).default(''),
		courtId: z.union([uuid, z.literal('')]).default(''),
		coachId: z.union([uuid, z.literal('')]).default(''),
		date: localDate,
		start: localTime,
		end: localTime,
		kind: z.enum(['practice', 'match']).default('practice'),
		opponent: z.string().trim().max(120, 'Too long').default(''),
		homeAway: z.union([z.enum(['home', 'away']), z.literal('')]).default(''),
		notes: z.string().trim().max(500, 'Too long').default(''),
		venueNote: z.string().trim().max(240, 'Too long').default('')
	})
	.refine((v) => v.end > v.start, { path: ['end'], message: 'End after the start' })
	.refine((v) => v.type === 'private' || v.parentId !== '', {
		path: ['parentId'],
		message: 'Choose one'
	})
	.refine(
		(v) => v.courtId !== '' || (v.type === 'team' && v.kind === 'match' && v.homeAway === 'away'),
		{ path: ['courtId'], message: 'Only a team away match can have no court' }
	)
	.refine((v) => v.type !== 'team' || v.kind !== 'match' || v.opponent !== '', {
		path: ['opponent'],
		message: 'Name the opponent'
	})
	.refine((v) => v.type !== 'team' || v.kind !== 'match' || v.homeAway !== '', {
		path: ['homeAway'],
		message: 'Home or away'
	});
export type SessionInput = z.infer<typeof sessionSchema>;

export type ScheduleSession = {
	id: string;
	type: SessionType;
	startsAt: string;
	endsAt: string;
	cancelled: boolean;
	title: string;
	notes: string | null;
	venueNote: string | null;
	courtId: string | null;
	courtName: string | null;
	locationId: string | null;
	locationName: string | null;
	coachId: string | null;
	coachName: string | null;
	parentId: string | null;
	levelKeys: string[];
};

type ViewRow = {
	id: string;
	session_type: SessionType;
	starts_at: string;
	ends_at: string;
	status: 'scheduled' | 'cancelled';
	notes: string | null;
	venue_note: string | null;
	court_id: string | null;
	court_name: string | null;
	location_id: string | null;
	location_name: string | null;
	coach_id: string | null;
	coach_name: string | null;
	title: string | null;
	parent_id: string | null;
	level_keys: string[] | null;
};

const VIEW_SELECT =
	'id, session_type, starts_at, ends_at, status, notes, venue_note, court_id, court_name, location_id, location_name, coach_id, coach_name, title, parent_id, level_keys';

const toSession = (r: ViewRow): ScheduleSession => ({
	id: r.id,
	type: r.session_type,
	startsAt: r.starts_at,
	endsAt: r.ends_at,
	cancelled: r.status === 'cancelled',
	title: r.title ?? 'Session',
	notes: r.notes,
	venueNote: r.venue_note,
	courtId: r.court_id,
	courtName: r.court_name,
	locationId: r.location_id,
	locationName: r.location_name,
	coachId: r.coach_id,
	coachName: r.coach_name,
	parentId: r.parent_id,
	levelKeys: r.level_keys ?? []
});

/** Everything at one location on one academy-local day — what the admin grid draws. */
export async function listDay(
	db: ScheduleDb,
	opts: { locationId: string; localDate: string; tz: string }
): Promise<Result<ScheduleSession[]>> {
	const { startsAt, endsAt } = dayBounds(opts.localDate, opts.tz);
	const { data, error } = await db
		.from('v_schedule_sessions')
		.select(VIEW_SELECT)
		.gte('starts_at', startsAt)
		.lt('starts_at', endsAt)
		.eq('location_id', opts.locationId)
		.order('starts_at');
	if (error) return err(fromPostgres(error));
	return ok(((data ?? []) as unknown as ViewRow[]).map(toSession));
}

/** One occurrence, read from the same view the grid draws — the edit screen's source. */
export async function getSession(
	db: ScheduleDb,
	id: string
): Promise<Result<ScheduleSession | null>> {
	const { data, error } = await db
		.from('v_schedule_sessions')
		.select(VIEW_SELECT)
		.eq('id', id)
		.maybeSingle();
	if (error) return err(fromPostgres(error));
	return ok(data ? toSession(data as unknown as ViewRow) : null);
}

/** Every session belonging to one camp or team — the detail screens' day list. */
export async function listByParent(
	db: ScheduleDb,
	type: SessionType,
	parentId: string
): Promise<Result<ScheduleSession[]>> {
	const { data, error } = await db
		.from('v_schedule_sessions')
		.select(VIEW_SELECT)
		.eq('session_type', type)
		.eq('parent_id', parentId)
		.order('starts_at');
	if (error) return err(fromPostgres(error));
	return ok(((data ?? []) as unknown as ViewRow[]).map(toSession));
}

/**
 * A run of whole local days from `from` — the portal's fortnight and the public page. Asks for
 * scheduled sessions explicitly: anon RLS already limits it, but a signed-in coach reading the
 * portal would otherwise see cancellations a family never sees.
 */
export async function listRange(
	db: ScheduleDb,
	opts: { from: string; days: number; tz: string }
): Promise<Result<ScheduleSession[]>> {
	const [y, m, d] = opts.from.split('-').map(Number);
	const until = new Date(Date.UTC(y, m - 1, d + opts.days)).toISOString().slice(0, 10);
	const { data, error } = await db
		.from('v_schedule_sessions')
		.select(VIEW_SELECT)
		.gte('starts_at', dayBounds(opts.from, opts.tz).startsAt)
		.lt('starts_at', dayBounds(until, opts.tz).startsAt)
		.eq('status', 'scheduled')
		.order('starts_at');
	if (error) return err(fromPostgres(error));
	return ok(((data ?? []) as unknown as ViewRow[]).map(toSession));
}

/**
 * N: an untagged slot is open to every level; a tagged one needs the player's level among its
 * tags; a player with no level yet can only take untagged slots. This mirrors
 * `enforce_class_booking` exactly, so a family never sees a slot booking would then refuse.
 */
export function filterForPlayer<T extends { levelKeys: string[] }>(
	sessions: T[],
	levelKey: string | null
): T[] {
	return sessions.filter(
		(s) => s.levelKeys.length === 0 || (levelKey !== null && s.levelKeys.includes(levelKey))
	);
}

/** The subtype row that gives a session its identity. Written per branch so each table name
 *  is a literal the generated types can check the row against. */
async function insertSubtype(db: ScheduleDb, input: SessionInput, sessionId: string) {
	switch (input.type) {
		case 'class':
			return (
				await db.from('class_sessions').insert({ session_id: sessionId, class_id: input.parentId })
			).error;
		case 'camp':
			return (
				await db.from('camp_sessions').insert({ session_id: sessionId, camp_id: input.parentId })
			).error;
		case 'team':
			return (
				await db.from('team_sessions').insert({
					session_id: sessionId,
					team_id: input.parentId,
					kind: input.kind,
					opponent: input.kind === 'match' ? input.opponent : null,
					home_away: input.kind === 'match' ? input.homeAway || null : null
				})
			).error;
		default:
			return null; // a private session is the court and the coach being held, nothing more
	}
}

const sessionRow = (input: SessionInput, tz: string) => ({
	starts_at: localInstant(input.date, input.start, tz),
	ends_at: localInstant(input.date, input.end, tz),
	court_id: input.courtId || null,
	coach_id: input.coachId || null,
	notes: input.notes || null,
	venue_note: input.venueNote || null
});

/**
 * Two writes without a transaction: PostgREST has none. The session row goes first because it
 * is the one the constraints guard, and a failed subtype insert deletes it again — an orphan
 * session would render as an untitled block on the grid that nothing owns.
 */
export async function createSession(
	db: ScheduleDb,
	input: SessionInput,
	tz: string
): Promise<Result<{ id: string }>> {
	// Routes validate with superforms, but camps.ts and teams.ts assemble an input themselves —
	// the one writer checks its own contract rather than trusting every caller.
	const parsed = sessionSchema.safeParse(input);
	if (!parsed.success) return err(new AppError('validation', parsed.error.issues[0]?.message));

	const { data, error } = await db
		.from('sessions')
		.insert({ session_type: input.type, ...sessionRow(input, tz) })
		.select('id')
		.single();
	if (error) return err(fromPostgres(error));
	const id = (data as { id: string }).id;

	const childError = await insertSubtype(db, input, id);
	if (childError) {
		await db.from('sessions').delete().eq('id', id);
		return err(fromPostgres(childError));
	}
	return ok({ id });
}

/** Moving a session is an UPDATE the availability and EXCLUDE triggers check for themselves. */
export async function updateSession(
	db: ScheduleDb,
	id: string,
	input: SessionInput,
	tz: string
): Promise<Result<null>> {
	const { error } = await db.from('sessions').update(sessionRow(input, tz)).eq('id', id);
	if (error) return err(fromPostgres(error));
	return ok(null);
}

export async function setSessionLevels(
	db: ScheduleDb,
	sessionId: string,
	levelKeys: string[]
): Promise<Result<{ tagged: number }>> {
	const { data, error } = await db.rpc('set_session_levels', {
		p_session: sessionId,
		p_level_keys: levelKeys
	});
	if (error) return err(fromPostgres(error));
	return ok({ tagged: (data as number) ?? 0 });
}

/** `cancel_session` makes every booked player whole; the count is what the console reports. */
export async function cancelSession(
	db: ScheduleDb,
	id: string,
	reason: string
): Promise<Result<{ madeWhole: number }>> {
	const { data, error } = await db.rpc('cancel_session', {
		p_session: id,
		p_reason: reason || undefined
	});
	if (error) return err(fromPostgres(error));
	return ok({ madeWhole: (data as number) ?? 0 });
}
