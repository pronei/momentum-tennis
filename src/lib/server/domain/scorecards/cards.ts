import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '$lib/server/db/database.types';
import { AppError, err, fromPostgres, ok, type Result } from '$lib/server/domain/result';
import { academyDate, academyTime } from '$lib/server/domain/time';
import type { CardHeader, CardInput, HeaderInput } from './form';
import {
	isPosition,
	orderedPositions,
	POSITIONS,
	resolveLine,
	type Line,
	type LineInput,
	type LineResult,
	type Position,
	type ScorecardFormat,
	type SetGames,
	type Side
} from './format';

// Reads and writes under the caller's RLS. Staff see every card; a coach's write to a final card
// matches no row, which is how `scorecard_final` is detected. The eight lines exist from the
// insert (0010's trigger), so saving is always an update.

export type ScorecardsDb = Pick<SupabaseClient<Database>, 'from'>;
export type ScorecardStatus = 'draft' | 'final';

export type Scorecard = CardHeader & {
	id: string;
	teamId: string;
	teamName: string;
	sessionId: string | null;
	status: ScorecardStatus;
	finalizedAt: string | null;
	createdAt: string;
};

type CardRow = {
	id: string;
	team_id: string;
	session_id: string | null;
	match_id: string | null;
	played_on: string;
	start_time: string | null;
	division: string;
	home_team: string;
	away_team: string;
	location: string;
	momentum_side: Side;
	format: ScorecardFormat;
	set_games: number;
	status: ScorecardStatus;
	home_sportsmanship: string | null;
	away_sportsmanship: string | null;
	notes: string | null;
	finalized_at: string | null;
	created_at: string;
	teams: { name: string } | null;
};
type LineRow = {
	id: string;
	position: string;
	home_player1_id: string | null;
	home_player1_name: string;
	home_player2_id: string | null;
	home_player2_name: string;
	away_player1_id: string | null;
	away_player1_name: string;
	away_player2_id: string | null;
	away_player2_name: string;
	home_games: number | null;
	away_games: number | null;
	result: LineResult | null;
	winner: Side | null;
};

const CARD_COLUMNS =
	'id, team_id, session_id, match_id, played_on, start_time, division, home_team, away_team, location, momentum_side, format, set_games, status, home_sportsmanship, away_sportsmanship, notes, finalized_at, created_at, teams ( name )';
const LINE_COLUMNS =
	'id, position, home_player1_id, home_player1_name, home_player2_id, home_player2_name, away_player1_id, away_player1_name, away_player2_id, away_player2_name, home_games, away_games, result, winner';

const toCard = (r: CardRow): Scorecard => ({
	id: r.id,
	teamId: r.team_id,
	teamName: r.teams?.name ?? '',
	sessionId: r.session_id,
	matchId: r.match_id,
	playedOn: r.played_on,
	startTime: r.start_time ? r.start_time.slice(0, 5) : null,
	division: r.division,
	homeTeam: r.home_team,
	awayTeam: r.away_team,
	location: r.location,
	momentumSide: r.momentum_side,
	format: r.format,
	setGames: r.set_games as SetGames,
	status: r.status,
	homeSportsmanship: r.home_sportsmanship ?? '',
	awaySportsmanship: r.away_sportsmanship ?? '',
	notes: r.notes ?? '',
	finalizedAt: r.finalized_at,
	createdAt: r.created_at
});

const toLine = (r: LineRow): Line | null =>
	isPosition(r.position)
		? {
				id: r.id,
				position: r.position,
				names: {
					home1: r.home_player1_name,
					home2: r.home_player2_name,
					away1: r.away_player1_name,
					away2: r.away_player2_name
				},
				playerIds: {
					home1: r.home_player1_id,
					home2: r.home_player2_id,
					away1: r.away_player1_id,
					away2: r.away_player2_id
				},
				homeGames: r.home_games,
				awayGames: r.away_games,
				result: r.result,
				winner: r.winner
			}
		: null;

export async function listScorecards(db: ScorecardsDb): Promise<Result<Scorecard[]>> {
	const { data, error } = await db
		.from('scorecards')
		.select(CARD_COLUMNS)
		.order('played_on', { ascending: false })
		.order('created_at', { ascending: false });
	if (error) return err(fromPostgres(error));
	return ok(((data ?? []) as unknown as CardRow[]).map(toCard));
}

export async function getScorecard(
	db: ScorecardsDb,
	id: string
): Promise<Result<{ card: Scorecard; lines: Line[] } | null>> {
	const { data, error } = await db
		.from('scorecards')
		.select(CARD_COLUMNS)
		.eq('id', id)
		.maybeSingle();
	if (error) return err(fromPostgres(error));
	if (!data) return ok(null);
	const card = toCard(data as unknown as CardRow);
	const rows = await db.from('scorecard_lines').select(LINE_COLUMNS).eq('scorecard_id', id);
	if (rows.error) return err(fromPostgres(rows.error));
	const byPosition = new Map<Position, Line>();
	for (const r of (rows.data ?? []) as unknown as LineRow[]) {
		const l = toLine(r);
		if (l) byPosition.set(l.position, l);
	}
	return ok({ card, lines: orderedPositions(card.format).flatMap((p) => byPosition.get(p) ?? []) });
}

const headerRow = (input: CardInput) => ({
	match_id: input.matchId || null,
	played_on: input.playedOn,
	start_time: input.startTime || null,
	division: input.division,
	home_team: input.homeTeam,
	away_team: input.awayTeam,
	location: input.location,
	momentum_side: input.momentumSide,
	format: input.format,
	set_games: Number(input.setGames),
	home_sportsmanship: input.homeSportsmanship || null,
	away_sportsmanship: input.awaySportsmanship || null,
	notes: input.notes || null
});

/** The insert policy wants `created_by = auth.uid()`; the trigger seeds the eight lines. */
export async function createScorecard(
	db: ScorecardsDb,
	input: HeaderInput,
	createdBy: string
): Promise<Result<{ id: string }>> {
	const { data, error } = await db
		.from('scorecards')
		.insert({
			...headerRow(input),
			team_id: input.teamId,
			session_id: input.sessionId || null,
			created_by: createdBy
		})
		.select('id')
		.single();
	if (error) return err(fromPostgres(error));
	return ok({ id: (data as { id: string }).id });
}

export type RosterName = { playerId: string; fullName: string };
const fold = (s: string) =>
	s
		.normalize('NFD')
		.replace(/\p{M}/gu, '')
		.toLowerCase()
		.replace(/\s+/g, ' ')
		.trim();

/** A typed name links to a roster player only when exactly one full name matches, ignoring case and accents. */
export function linkRoster(name: string, roster: RosterName[]): string | null {
	const key = fold(name);
	if (!key) return null;
	const hits = roster.filter((r) => fold(r.fullName) === key);
	return hits.length === 1 ? hits[0].playerId : null;
}

/**
 * The header and all eight lines, one update each. A draft needs no transaction — finalize is the
 * atomic gate — and the header goes first: when it matches no row the card is final and nothing
 * else is touched.
 */
export async function saveCard(
	db: ScorecardsDb,
	id: string,
	header: CardInput,
	lines: Record<Position, LineInput>,
	roster: RosterName[]
): Promise<Result<null>> {
	const head = await db
		.from('scorecards')
		.update(headerRow(header))
		.eq('id', id)
		.eq('status', 'draft')
		.select('id');
	if (head.error) return err(fromPostgres(head.error));
	if (!head.data?.length) return err(new AppError('scorecard_final'));
	const setGames = Number(header.setGames) as SetGames;
	const link = (side: Side, name: string) =>
		side === header.momentumSide ? linkRoster(name, roster) : null;
	for (const p of POSITIONS) {
		const l = lines[p];
		const r = resolveLine(l, setGames);
		const { error } = await db
			.from('scorecard_lines')
			.update({
				home_player1_name: l.names.home1,
				home_player1_id: link('home', l.names.home1),
				home_player2_name: l.names.home2,
				home_player2_id: link('home', l.names.home2),
				away_player1_name: l.names.away1,
				away_player1_id: link('away', l.names.away1),
				away_player2_name: l.names.away2,
				away_player2_id: link('away', l.names.away2),
				home_games: r.homeGames,
				away_games: r.awayGames,
				result: r.result,
				winner: r.winner
			})
			.eq('scorecard_id', id)
			.eq('position', p);
		if (error) return err(fromPostgres(error));
	}
	return ok(null);
}

/** Draft → final. The trigger refuses an incomplete card with `scorecard_incomplete: <detail>`. */
export async function finalize(db: ScorecardsDb, id: string): Promise<Result<null>> {
	const { data, error } = await db
		.from('scorecards')
		.update({ status: 'final' })
		.eq('id', id)
		.eq('status', 'draft')
		.select('id');
	if (error) return err(fromPostgres(error));
	if (!data?.length) return err(new AppError('scorecard_final'));
	return ok(null);
}

/** Final → draft. RLS lets only an admin touch a final card, so a coach matches no row. */
export async function reopen(db: ScorecardsDb, id: string): Promise<Result<null>> {
	const { data, error } = await db
		.from('scorecards')
		.update({ status: 'draft' })
		.eq('id', id)
		.eq('status', 'final')
		.select('id');
	if (error) return err(fromPostgres(error));
	if (!data?.length) return err(new AppError('admin_only'));
	return ok(null);
}

/** Only an admin, only a draft (the delete policy); lines cascade. */
export async function deleteDraft(db: ScorecardsDb, id: string): Promise<Result<null>> {
	const { data, error } = await db
		.from('scorecards')
		.delete()
		.eq('id', id)
		.eq('status', 'draft')
		.select('id');
	if (error) return err(fromPostgres(error));
	if (!data?.length) return err(new AppError('admin_only'));
	return ok(null);
}

export type MatchOption = {
	sessionId: string;
	label: string;
	playedOn: string;
	startTime: string;
	opponent: string;
	homeAway: Side | null;
	location: string;
};
type MatchRow = {
	session_id: string;
	opponent: string | null;
	home_away: Side | null;
	sessions: {
		starts_at: string;
		status: string;
		venue_note: string | null;
		courts: { name: string; locations: { name: string } | null } | null;
	} | null;
};

/** A team's scheduled matches, newest first, in academy time — the prefill on `new`. */
export async function teamMatches(
	db: ScorecardsDb,
	teamId: string,
	tz: string
): Promise<Result<MatchOption[]>> {
	const { data, error } = await db
		.from('team_sessions')
		.select(
			'session_id, opponent, home_away, sessions ( starts_at, status, venue_note, courts ( name, locations ( name ) ) )'
		)
		.eq('team_id', teamId)
		.eq('kind', 'match');
	if (error) return err(fromPostgres(error));
	const options = ((data ?? []) as unknown as MatchRow[])
		.filter((m) => m.sessions?.status === 'scheduled')
		.map((m) => {
			const s = m.sessions!;
			const playedOn = academyDate(s.starts_at, tz);
			const startTime = academyTime(s.starts_at, tz);
			const location = s.courts
				? [s.courts.name, s.courts.locations?.name].filter(Boolean).join(' · ')
				: (s.venue_note ?? '');
			const opponent = m.opponent ?? '';
			return {
				sessionId: m.session_id,
				playedOn,
				startTime,
				opponent,
				homeAway: m.home_away,
				location,
				label: `${playedOn} · ${startTime} · VS ${opponent.toUpperCase() || '?'} · ${(m.home_away ?? 'home').toUpperCase()}`
			};
		});
	return ok(options.sort((a, b) => b.playedOn.localeCompare(a.playedOn)));
}
