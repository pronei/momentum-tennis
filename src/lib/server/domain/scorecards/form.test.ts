import { describe, expect, it } from 'vitest';
import type { Line } from './format';
import {
	fieldValues,
	headerSchema,
	lineField,
	parseHeader,
	parseLines,
	submittedFields
} from './form';

const form = (entries: Record<string, string>) => {
	const d = new FormData();
	for (const [k, v] of Object.entries(entries)) d.set(k, v);
	return d;
};
const header = {
	matchId: '2743999',
	playedOn: '2026-10-04',
	startTime: '14:00',
	division: '12U Green',
	homeTeam: 'Chippers',
	awayTeam: 'Momentum Tennis 12U Green A',
	location: 'Backesto Park',
	momentumSide: 'away',
	format: 'three_court',
	setGames: '6',
	homeSportsmanship: '',
	awaySportsmanship: '',
	notes: ''
};
const TEAM = '00000000-0000-4000-8000-000000000001';

describe('headerSchema', () => {
	it('accepts the card header and defaults the optional fields', () => {
		const r = headerSchema.safeParse({ ...header, teamId: TEAM });
		expect(r.success).toBe(true);
		if (r.success) expect(r.data.sessionId).toBe('');
	});
	it('refuses a match id that is not digits and a missing team name', () => {
		const r = headerSchema.safeParse({ ...header, teamId: TEAM, matchId: '27-43', homeTeam: '' });
		expect(r.success).toBe(false);
		if (!r.success)
			expect(r.error.issues.map((i) => String(i.path[0])).sort()).toEqual(['homeTeam', 'matchId']);
	});
});

describe('parseHeader / parseLines', () => {
	it('parses the header without the team and match fields', () => {
		const r = parseHeader(form(header));
		expect(r.errors).toEqual({});
		expect(r.value?.setGames).toBe('6');
		expect(r.value?.momentumSide).toBe('away');
	});
	it('keys header errors by field name', () => {
		const r = parseHeader(form({ ...header, playedOn: 'Sunday' }));
		expect(r.value).toBeNull();
		expect(r.errors.playedOn).toBe('Use YYYY-MM-DD');
	});
	it('parses eight lines, blank games as no score, and FROM SCORE as empty', () => {
		const r = parseLines(
			form({
				[lineField('1S', 'home1')]: 'Ada Lovelace',
				[lineField('1S', 'away1')]: 'Grace Hopper',
				[lineField('1S', 'hg')]: '6',
				[lineField('1S', 'ag')]: '2'
			})
		);
		expect(r.errors).toEqual({});
		expect(Object.keys(r.lines)).toHaveLength(8);
		expect(r.lines['1S']).toEqual({
			names: { home1: 'Ada Lovelace', home2: '', away1: 'Grace Hopper', away2: '' },
			homeGames: 6,
			awayGames: 2,
			result: '',
			winner: ''
		});
		expect(r.lines['2S'].homeGames).toBeNull();
	});
	it('refuses a games value outside 0–7 and a one-sided score, keyed by field', () => {
		const r = parseLines(
			form({
				[lineField('1S', 'hg')]: '9',
				[lineField('1S', 'ag')]: '2',
				[lineField('2S', 'hg')]: '4'
			})
		);
		expect(r.errors[lineField('1S', 'hg')]).toBe('0 to 7');
		expect(r.errors[lineField('2S', 'hg')]).toBe('Enter both scores');
	});
});

describe('fieldValues / submittedFields', () => {
	const line: Line = {
		id: 'l1',
		position: '1S',
		names: { home1: 'Ada Lovelace', home2: '', away1: 'Grace Hopper', away2: '' },
		playerIds: { home1: null, home2: null, away1: null, away2: null },
		homeGames: 6,
		awayGames: 2,
		result: 'completed',
		winner: 'home'
	};
	const stored = {
		...header,
		matchId: '2743999' as string | null,
		startTime: '14:00' as string | null,
		momentumSide: 'away' as const,
		format: 'three_court' as const,
		setGames: 6 as const
	};
	it('flattens a stored card into field values, selects at FROM SCORE when derived', () => {
		const v = fieldValues(stored, [line]);
		expect(v.matchId).toBe('2743999');
		expect(v.setGames).toBe('6');
		expect(v[lineField('1S', 'home1')]).toBe('Ada Lovelace');
		expect(v[lineField('1S', 'hg')]).toBe('6');
		expect(v[lineField('1S', 'result')]).toBe('');
		expect(v[lineField('1S', 'winner')]).toBe('');
	});
	it('renders a chosen result that the score does not derive', () => {
		const v = fieldValues({ ...stored, matchId: null, startTime: null }, [
			{ ...line, result: 'retired' }
		]);
		expect(v[lineField('1S', 'result')]).toBe('retired');
		expect(v.matchId).toBe('');
		expect(v.startTime).toBe('');
	});
	it('keeps a submission as strings', () => {
		expect(submittedFields(form({ a: '1', b: '' }))).toEqual({ a: '1', b: '' });
	});
});
