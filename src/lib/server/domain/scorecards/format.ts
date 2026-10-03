// USTA Junior Team Tennis, as the paper scorecard records it. Pure: no database, no clock.
// Both card formats carry the same eight lines; they differ only in which lines play together.

export const POSITIONS = ['1S', '2S', '3S', '4S', '1D', '2D', '3D', '4D'] as const;
export type Position = (typeof POSITIONS)[number];
export type ScorecardFormat = 'two_court' | 'three_court';
export type Side = 'home' | 'away';
export type LineResult = 'completed' | 'timed' | 'retired' | 'default' | 'double_default';
export type SetGames = 4 | 6;

export const FORMATS: ScorecardFormat[] = ['two_court', 'three_court'];
export const RESULTS: LineResult[] = ['completed', 'timed', 'retired', 'default', 'double_default'];

/** Which lines play together. The 3-court card is the alternative both captains must agree to. */
export const ROUNDS: Record<ScorecardFormat, readonly (readonly Position[])[]> = {
	two_court: [
		['1S', '4D'],
		['2S', '3D'],
		['3S', '2D'],
		['4S', '1D']
	],
	three_court: [
		['1S', '2S', '4D'],
		['3S', '4S', '1D'],
		['2D', '3D']
	]
};

export const FORMAT_LABELS: Record<ScorecardFormat, string> = {
	two_court: '2 COURTS',
	three_court: '3 COURTS'
};
export const RESULT_LABELS: Record<LineResult, string> = {
	completed: 'Completed',
	timed: 'Timed match',
	retired: 'Retired',
	default: 'Default',
	double_default: 'Double default'
};

export const isPosition = (s: string): s is Position => (POSITIONS as readonly string[]).includes(s);
export const isDoubles = (p: Position): boolean => p.endsWith('D');
/** `1S` → `#1 Singles`: the form the automation's observed card uses. */
export const positionLabel = (p: Position): string =>
	`#${p[0]} ${isDoubles(p) ? 'Doubles' : 'Singles'}`;
export const roundOf = (format: ScorecardFormat, p: Position): number =>
	ROUNDS[format].findIndex((r) => r.includes(p)) + 1;
/** Positions in the order the card plays them: by round, then as printed. */
export const orderedPositions = (format: ScorecardFormat): Position[] => ROUNDS[format].flat();

export type Games = { home: number | null; away: number | null };

/** Completed when one side has exactly the set's games and the other fewer; timed when both have fewer. */
export function suggestResult(g: Games, setGames: SetGames): 'completed' | 'timed' | null {
	if (g.home === null || g.away === null) return null;
	const hi = Math.max(g.home, g.away);
	const lo = Math.min(g.home, g.away);
	if (hi === setGames && lo < setGames) return 'completed';
	if (hi < setGames) return 'timed';
	return null;
}

/** More games wins; equal games decide nothing. */
export function suggestWinner(g: Games): Side | null {
	if (g.home === null || g.away === null || g.home === g.away) return null;
	return g.home > g.away ? 'home' : 'away';
}

export type Slots = { home1: string; home2: string; away1: string; away2: string };
export type Line = {
	id: string;
	position: Position;
	names: Slots;
	playerIds: Record<keyof Slots, string | null>;
	homeGames: number | null;
	awayGames: number | null;
	result: LineResult | null;
	winner: Side | null;
};
/** What the form submits for a line. '' on result or winner means "from score". */
export type LineInput = {
	names: Slots;
	homeGames: number | null;
	awayGames: number | null;
	result: LineResult | '';
	winner: Side | '';
};
export type Resolved = Pick<Line, 'homeGames' | 'awayGames' | 'result' | 'winner'>;

/**
 * Turns a submission into what the row stores. A chosen result or winner stands; "from score"
 * derives one. A played result (completed, timed, retired) needs games and a winner to be a
 * result at all — until then it stays null and the readiness list says what is missing.
 */
export function resolveLine(input: LineInput, setGames: SetGames): Resolved {
	const games = { home: input.homeGames, away: input.awayGames };
	const result = input.result || suggestResult(games, setGames);
	if (result === 'double_default')
		return { result, winner: null, homeGames: null, awayGames: null };
	const winner = input.winner || suggestWinner(games);
	if (result === 'default')
		return {
			result: winner ? result : null,
			winner,
			homeGames: input.homeGames,
			awayGames: input.awayGames
		};
	const played = result !== null && games.home !== null && winner !== null;
	return {
		result: played ? result : null,
		winner,
		homeGames: input.homeGames,
		awayGames: input.awayGames
	};
}

/** The select values the card page shows: '' (from score) whenever the stored value is the derived one. */
export function fromScore(
	line: Pick<Line, 'homeGames' | 'awayGames' | 'result' | 'winner'>,
	setGames: SetGames
): { result: LineResult | ''; winner: Side | '' } {
	const games = { home: line.homeGames, away: line.awayGames };
	return {
		result: line.result === suggestResult(games, setGames) ? '' : (line.result ?? ''),
		winner: line.winner === suggestWinner(games) ? '' : (line.winner ?? '')
	};
}

export function totals(lines: Pick<Line, 'homeGames' | 'awayGames'>[]): {
	home: number;
	away: number;
} {
	return lines.reduce(
		(t, l) => ({ home: t.home + (l.homeGames ?? 0), away: t.away + (l.awayGames ?? 0) }),
		{ home: 0, away: 0 }
	);
}

const namesFilled = (line: Line, side: Side): boolean => {
	const one = side === 'home' ? line.names.home1 : line.names.away1;
	const two = side === 'home' ? line.names.home2 : line.names.away2;
	return one.trim() !== '' && (!isDoubles(line.position) || two.trim() !== '');
};

/** Mirrors the finalize trigger, in play order, as mono lines for the card page. Empty = ready. */
export function completeness(
	card: { matchId: string | null; format: ScorecardFormat },
	lines: Line[]
): string[] {
	const out: string[] = [];
	if (!card.matchId) out.push('MATCH ID MISSING');
	for (const p of orderedPositions(card.format)) {
		const line = lines.find((l) => l.position === p);
		if (!line) continue;
		const tag = positionLabel(p).toUpperCase();
		if (line.result === null) {
			if (line.homeGames === null) out.push(`${tag} · NO SCORE`);
			else if (line.winner === null) out.push(`${tag} · NAME THE WINNER`);
			else out.push(`${tag} · CHOOSE A RESULT`);
			continue;
		}
		if (line.result === 'double_default') continue;
		if (line.result === 'default') {
			if (line.winner && !namesFilled(line, line.winner))
				out.push(`${tag} · NAMES NOBODY ON THE WINNING SIDE`);
			continue;
		}
		if (!namesFilled(line, 'home') || !namesFilled(line, 'away'))
			out.push(`${tag} · MISSING A PLAYER NAME`);
	}
	return out;
}
