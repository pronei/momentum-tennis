import { z } from 'zod';
import { localDate, localTime, uuid } from '$lib/server/domain/schedule/common';
import {
	fromScore,
	POSITIONS,
	type Line,
	type LineInput,
	type Position,
	type ScorecardFormat,
	type SetGames,
	type Side
} from './format';

// The card page is one form. Header fields carry the schema key as their name; line fields are
// `<position>_<slot>`. Everything here is pure so the contract is tested without a request.

const text = (max: number) => z.string().trim().max(max, 'Too long');

/** The header a coach types. `new` takes all of it; the card page everything but the team and match. */
export const headerSchema = z.object({
	teamId: uuid,
	sessionId: z.union([uuid, z.literal('')]).default(''),
	matchId: z.string().trim().regex(/^\d{0,12}$/, 'Digits only').default(''),
	playedOn: localDate,
	startTime: z.union([localTime, z.literal('')]).default(''),
	division: text(64).default(''),
	homeTeam: text(120).min(1, 'Name the home team'),
	awayTeam: text(120).min(1, 'Name the visiting team'),
	location: text(120).default(''),
	momentumSide: z.enum(['home', 'away']).default('home'),
	format: z.enum(['two_court', 'three_court']).default('two_court'),
	setGames: z.enum(['4', '6']).default('6'),
	homeSportsmanship: text(120).default(''),
	awaySportsmanship: text(120).default(''),
	notes: text(1000).default('')
});
export type HeaderInput = z.infer<typeof headerSchema>;
export const cardSchema = headerSchema.omit({ teamId: true, sessionId: true });
export type CardInput = z.infer<typeof cardSchema>;

const games = z
	.string()
	.trim()
	.regex(/^[0-7]?$/, '0 to 7')
	.default('')
	.transform((v) => (v === '' ? null : Number(v)));
export const lineSchema = z
	.object({
		home1: text(80).default(''),
		home2: text(80).default(''),
		away1: text(80).default(''),
		away2: text(80).default(''),
		homeGames: games,
		awayGames: games,
		result: z.enum(['', 'completed', 'timed', 'retired', 'default', 'double_default']).default(''),
		winner: z.enum(['', 'home', 'away']).default('')
	})
	.refine((l) => (l.homeGames === null) === (l.awayGames === null), {
		message: 'Enter both scores',
		path: ['homeGames']
	});

export type LineSlot = 'home1' | 'home2' | 'away1' | 'away2' | 'hg' | 'ag' | 'result' | 'winner';
export const lineField = (p: Position, slot: LineSlot): string => `${p}_${slot}`;

/** What the stored card looks like to the form: the header the page edits. */
export type CardHeader = {
	matchId: string | null;
	playedOn: string;
	startTime: string | null;
	division: string;
	homeTeam: string;
	awayTeam: string;
	location: string;
	momentumSide: Side;
	format: ScorecardFormat;
	setGames: SetGames;
	homeSportsmanship: string;
	awaySportsmanship: string;
	notes: string;
};

const issues = (error: z.ZodError, rename: Record<string, string> = {}) => {
	const out: Record<string, string> = {};
	for (const issue of error.issues) {
		const key = String(issue.path[0] ?? '');
		out[rename[key] ?? key] ??= issue.message;
	}
	return out;
};

export function parseHeader(data: FormData): {
	value: CardInput | null;
	errors: Record<string, string>;
} {
	const parsed = cardSchema.safeParse(Object.fromEntries(data));
	return parsed.success
		? { value: parsed.data, errors: {} }
		: { value: null, errors: issues(parsed.error) };
}

const EMPTY: LineInput = {
	names: { home1: '', home2: '', away1: '', away2: '' },
	homeGames: null,
	awayGames: null,
	result: '',
	winner: ''
};

export function parseLines(data: FormData): {
	lines: Record<Position, LineInput>;
	errors: Record<string, string>;
} {
	const lines = {} as Record<Position, LineInput>;
	const errors: Record<string, string> = {};
	const get = (p: Position, slot: LineSlot) => String(data.get(lineField(p, slot)) ?? '');
	for (const p of POSITIONS) {
		const parsed = lineSchema.safeParse({
			home1: get(p, 'home1'),
			home2: get(p, 'home2'),
			away1: get(p, 'away1'),
			away2: get(p, 'away2'),
			homeGames: get(p, 'hg'),
			awayGames: get(p, 'ag'),
			result: get(p, 'result'),
			winner: get(p, 'winner')
		});
		if (parsed.success) {
			const l = parsed.data;
			lines[p] = {
				names: { home1: l.home1, home2: l.home2, away1: l.away1, away2: l.away2 },
				homeGames: l.homeGames,
				awayGames: l.awayGames,
				result: l.result,
				winner: l.winner
			};
		} else {
			lines[p] = EMPTY;
			for (const [key, message] of Object.entries(
				issues(parsed.error, { homeGames: 'hg', awayGames: 'ag' })
			))
				errors[`${p}_${key}`] = message;
		}
	}
	return { lines, errors };
}

/** Every field the card page renders, as strings, from the stored card. */
export function fieldValues(card: CardHeader, lines: Line[]): Record<string, string> {
	const v: Record<string, string> = {
		matchId: card.matchId ?? '',
		playedOn: card.playedOn,
		startTime: card.startTime ?? '',
		division: card.division,
		homeTeam: card.homeTeam,
		awayTeam: card.awayTeam,
		location: card.location,
		momentumSide: card.momentumSide,
		format: card.format,
		setGames: String(card.setGames),
		homeSportsmanship: card.homeSportsmanship,
		awaySportsmanship: card.awaySportsmanship,
		notes: card.notes
	};
	for (const l of lines) {
		const shown = fromScore(l, card.setGames);
		v[lineField(l.position, 'home1')] = l.names.home1;
		v[lineField(l.position, 'home2')] = l.names.home2;
		v[lineField(l.position, 'away1')] = l.names.away1;
		v[lineField(l.position, 'away2')] = l.names.away2;
		v[lineField(l.position, 'hg')] = l.homeGames === null ? '' : String(l.homeGames);
		v[lineField(l.position, 'ag')] = l.awayGames === null ? '' : String(l.awayGames);
		v[lineField(l.position, 'result')] = shown.result;
		v[lineField(l.position, 'winner')] = shown.winner;
	}
	return v;
}

/** A failed submission, kept on screen as typed. */
export const submittedFields = (data: FormData): Record<string, string> =>
	Object.fromEntries([...data.entries()].map(([k, val]) => [k, String(val)]));
