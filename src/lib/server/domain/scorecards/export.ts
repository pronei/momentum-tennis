import {
	orderedPositions,
	positionLabel,
	roundOf,
	totals,
	type Line,
	type LineResult,
	type ScorecardFormat,
	type SetGames,
	type Side
} from './format';

// The observed card the TennisLink automation ingests (tennislink-automation/outputs/momentum-tennis,
// src/pipeline/dry-run.ts ObservedCardSchema) without its three PDF render fields, plus the result
// and winner per line. Dates and times use the digital card's text forms. A line without games
// exports nulls and empty names: honest data, never invented zeros.

export type ExportHeader = {
	id: string;
	matchId: string | null;
	playedOn: string;
	startTime: string | null;
	division: string;
	homeTeam: string;
	awayTeam: string;
	location: string;
	format: ScorecardFormat;
	setGames: SetGames;
};
export type ObservedLine = {
	round: number;
	position_text: string;
	home_names: string[];
	away_names: string[];
	home_games: number | null;
	away_games: number | null;
	result: LineResult | null;
	winner: Side | null;
};
export type ExportDocument = {
	source: 'momentum-tennis-platform';
	scorecard_id: string;
	exported_at: string;
	format: ScorecardFormat;
	set_games: SetGames;
	card: {
		match_id: string | null;
		date_text: string;
		time_text: string;
		division: string;
		home_team: string;
		away_team: string;
		location: string;
		lines: ObservedLine[];
		printed_home_total: number;
		printed_away_total: number;
	};
};

/** 2026-10-04 → 10/04/26 */
export function dateText(playedOn: string): string {
	const [y, m, d] = playedOn.split('-');
	return `${m}/${d}/${y.slice(2)}`;
}

/** 14:00 or 14:00:00 → 2:00 PM; nothing → '' */
export function timeText(startTime: string | null): string {
	if (!startTime) return '';
	const [h, m] = startTime.split(':').map(Number);
	const hour = h % 12 === 0 ? 12 : h % 12;
	return `${hour}:${String(m).padStart(2, '0')} ${h < 12 ? 'AM' : 'PM'}`;
}

const names = (a: string, b: string): string[] => [a, b].map((n) => n.trim()).filter(Boolean);

export function observedCard(
	card: ExportHeader,
	lines: Line[],
	exportedAt: string
): ExportDocument {
	const ordered = orderedPositions(card.format).flatMap((p) =>
		lines.filter((l) => l.position === p)
	);
	const t = totals(lines);
	return {
		source: 'momentum-tennis-platform',
		scorecard_id: card.id,
		exported_at: exportedAt,
		format: card.format,
		set_games: card.setGames,
		card: {
			match_id: card.matchId,
			date_text: dateText(card.playedOn),
			time_text: timeText(card.startTime),
			division: card.division,
			home_team: card.homeTeam,
			away_team: card.awayTeam,
			location: card.location,
			lines: ordered.map((l) => ({
				round: roundOf(card.format, l.position),
				position_text: positionLabel(l.position),
				home_names: names(l.names.home1, l.names.home2),
				away_names: names(l.names.away1, l.names.away2),
				home_games: l.homeGames,
				away_games: l.awayGames,
				result: l.result,
				winner: l.winner
			})),
			printed_home_total: t.home,
			printed_away_total: t.away
		}
	};
}

export const exportFilename = (card: Pick<ExportHeader, 'id' | 'matchId'>): string =>
	`scorecard-${card.matchId ?? card.id.slice(0, 8)}.json`;
