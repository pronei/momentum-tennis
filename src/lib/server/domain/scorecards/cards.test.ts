import { describe, expect, it } from 'vitest';
import { called, fakeDb } from '$lib/server/domain/schedule/fakes';
import type { HeaderInput } from './form';
import type { LineInput, Position } from './format';
import {
	createScorecard,
	deleteDraft,
	finalize,
	getScorecard,
	linkRoster,
	listScorecards,
	reopen,
	saveCard,
	teamMatches
} from './cards';

const TEAM = '00000000-0000-4000-8000-000000000001';
const header: HeaderInput = {
	teamId: TEAM,
	sessionId: '',
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
const cardRow = {
	id: 'c1',
	team_id: TEAM,
	session_id: null,
	match_id: '2743999',
	played_on: '2026-10-04',
	start_time: '14:00:00',
	division: '12U Green',
	home_team: 'Chippers',
	away_team: 'Momentum Tennis 12U Green A',
	location: 'Backesto Park',
	momentum_side: 'away',
	format: 'three_court',
	set_games: 6,
	status: 'draft',
	home_sportsmanship: null,
	away_sportsmanship: null,
	notes: null,
	finalized_at: null,
	created_at: '2026-10-02T00:00:00Z',
	teams: { name: 'Momentum Tennis 12U Green A' }
};
const lineRow = (position: string) => ({
	id: `l-${position}`,
	position,
	home_player1_id: null,
	home_player1_name: '',
	home_player2_id: null,
	home_player2_name: '',
	away_player1_id: null,
	away_player1_name: '',
	away_player2_id: null,
	away_player2_name: '',
	home_games: null,
	away_games: null,
	result: null,
	winner: null
});
const firstCall = (calls: unknown[], method: string) =>
	(calls.find((c) => Array.isArray(c) && c[0] === method) as unknown[] | undefined)?.[1];

describe('reads', () => {
	it('lists cards newest first with the team name', async () => {
		const calls: unknown[] = [];
		const db = fakeDb({ tables: { scorecards: { data: [cardRow] } }, calls });
		const r = await listScorecards(db);
		expect(r.ok && r.value[0]).toMatchObject({
			id: 'c1',
			teamName: 'Momentum Tennis 12U Green A',
			startTime: '14:00',
			status: 'draft'
		});
		expect(called(calls, 'order', 'played_on', { ascending: false })).toBe(true);
	});
	it('reads a card with its lines in play order, or null', async () => {
		const db = fakeDb({
			tables: {
				scorecards: { data: cardRow },
				scorecard_lines: { data: ['1S', '2S', '3S', '4S', '1D', '2D', '3D', '4D'].map(lineRow) }
			}
		});
		const r = await getScorecard(db, 'c1');
		expect(r.ok && r.value?.lines.map((l) => l.position)).toEqual([
			'1S',
			'2S',
			'4D',
			'3S',
			'4S',
			'1D',
			'2D',
			'3D'
		]);
		const none = await getScorecard(fakeDb({ tables: { scorecards: { data: null } } }), 'c1');
		expect(none).toEqual({ ok: true, value: null });
	});
	it('maps a refused read', async () => {
		const r = await listScorecards(
			fakeDb({ tables: { scorecards: { error: { message: 'denied', code: '42501' } } } })
		);
		expect(!r.ok && r.error.code).toBe('not_authorized');
	});
});

describe('createScorecard', () => {
	it('inserts the header with the caller as author and returns the id', async () => {
		const calls: unknown[] = [];
		const db = fakeDb({ tables: { scorecards: { data: { id: 'c1' } } }, calls });
		const r = await createScorecard(db, header, 'acct-1');
		expect(r).toEqual({ ok: true, value: { id: 'c1' } });
		expect(firstCall(calls, 'insert')).toEqual({
			team_id: TEAM,
			session_id: null,
			match_id: '2743999',
			played_on: '2026-10-04',
			start_time: '14:00',
			division: '12U Green',
			home_team: 'Chippers',
			away_team: 'Momentum Tennis 12U Green A',
			location: 'Backesto Park',
			momentum_side: 'away',
			format: 'three_court',
			set_games: 6,
			home_sportsmanship: null,
			away_sportsmanship: null,
			notes: null,
			created_by: 'acct-1'
		});
	});
	it('a second card for the same match is a conflict', async () => {
		const r = await createScorecard(
			fakeDb({ tables: { scorecards: { error: { message: 'duplicate', code: '23505' } } } }),
			header,
			'acct-1'
		);
		expect(!r.ok && r.error.code).toBe('conflict');
	});
});

describe('linkRoster', () => {
	const roster = [
		{ playerId: 'p1', fullName: 'Ada Lovelace' },
		{ playerId: 'p2', fullName: 'Grace Hopper' },
		{ playerId: 'p3', fullName: 'Grace Hopper' }
	];
	it('links an exact name ignoring case and accents, never an ambiguous or absent one', () => {
		expect(linkRoster('ada lovelace', roster)).toBe('p1');
		expect(linkRoster('Ada  Lovelace ', roster)).toBe('p1');
		expect(linkRoster('Grace Hopper', roster)).toBeNull();
		expect(linkRoster('Alan Turing', roster)).toBeNull();
		expect(linkRoster('', roster)).toBeNull();
	});
});

describe('saveCard', () => {
	const empty: LineInput = {
		names: { home1: '', home2: '', away1: '', away2: '' },
		homeGames: null,
		awayGames: null,
		result: '',
		winner: ''
	};
	const lines = Object.fromEntries(
		['1S', '2S', '3S', '4S', '1D', '2D', '3D', '4D'].map((p) => [p, empty])
	) as Record<Position, LineInput>;
	const roster = [{ playerId: 'p1', fullName: 'Ada Lovelace' }];
	it('updates the draft header, then every line with the resolved result and the roster link on our side', async () => {
		const calls: unknown[] = [];
		const db = fakeDb({
			tables: { scorecards: { data: [{ id: 'c1' }] }, scorecard_lines: { data: [] } },
			calls
		});
		const r = await saveCard(
			db,
			'c1',
			header,
			{
				...lines,
				'1S': {
					names: { home1: 'Grace Hopper', home2: '', away1: 'Ada Lovelace', away2: '' },
					homeGames: 2,
					awayGames: 6,
					result: '',
					winner: ''
				}
			},
			roster
		);
		expect(r).toEqual({ ok: true, value: null });
		expect(called(calls, 'eq', 'status', 'draft')).toBe(true);
		const updates = calls.filter((c) => Array.isArray(c) && c[0] === 'update') as unknown[][];
		expect(updates).toHaveLength(9);
		expect(updates[1][1]).toMatchObject({
			home_player1_name: 'Grace Hopper',
			home_player1_id: null,
			away_player1_name: 'Ada Lovelace',
			away_player1_id: 'p1',
			home_games: 2,
			away_games: 6,
			result: 'completed',
			winner: 'away'
		});
		expect(called(calls, 'eq', 'position', '1S')).toBe(true);
	});
	it('a final card is refused before any line is touched', async () => {
		const calls: unknown[] = [];
		const r = await saveCard(
			fakeDb({ tables: { scorecards: { data: [] } }, calls }),
			'c1',
			header,
			lines,
			roster
		);
		expect(!r.ok && r.error.code).toBe('scorecard_final');
		expect(
			calls.filter((c) => Array.isArray(c) && c[0] === 'from' && c[1] === 'scorecard_lines')
		).toHaveLength(0);
	});
});

describe('finalize / reopen / deleteDraft', () => {
	it('finalize flips a draft and surfaces the gate token with its detail', async () => {
		const ok = await finalize(fakeDb({ tables: { scorecards: { data: [{ id: 'c1' }] } } }), 'c1');
		expect(ok).toEqual({ ok: true, value: null });
		const gate = await finalize(
			fakeDb({
				tables: {
					scorecards: { error: { message: 'scorecard_incomplete: 2D has no result', code: '23514' } }
				}
			}),
			'c1'
		);
		expect(!gate.ok && gate.error.code).toBe('scorecard_incomplete');
		expect(!gate.ok && gate.error.detail).toBe('2D has no result');
		const already = await finalize(fakeDb({ tables: { scorecards: { data: [] } } }), 'c1');
		expect(!already.ok && already.error.code).toBe('scorecard_final');
	});
	it('reopen and delete match no row for a coach — admin only', async () => {
		const r = await reopen(fakeDb({ tables: { scorecards: { data: [] } } }), 'c1');
		expect(!r.ok && r.error.code).toBe('admin_only');
		const d = await deleteDraft(fakeDb({ tables: { scorecards: { data: [] } } }), 'c1');
		expect(!d.ok && d.error.code).toBe('admin_only');
	});
});

describe('teamMatches', () => {
	it('lists a team’s scheduled matches in academy time, newest first, for the prefill', async () => {
		const db = fakeDb({
			tables: {
				team_sessions: {
					data: [
						{
							session_id: 's1',
							opponent: 'Chippers',
							home_away: 'away',
							sessions: {
								starts_at: '2026-10-04T21:00:00Z',
								status: 'scheduled',
								venue_note: 'Chippers home courts',
								courts: null
							}
						},
						{
							session_id: 's2',
							opponent: 'Alpine Hills',
							home_away: 'home',
							sessions: {
								starts_at: '2026-09-13T21:00:00Z',
								status: 'scheduled',
								venue_note: null,
								courts: { name: 'BP-1', locations: { name: 'Backesto Park' } }
							}
						},
						{
							session_id: 's3',
							opponent: 'Gone',
							home_away: 'home',
							sessions: {
								starts_at: '2026-09-20T21:00:00Z',
								status: 'cancelled',
								venue_note: null,
								courts: null
							}
						}
					]
				}
			}
		});
		const r = await teamMatches(db, TEAM, 'America/Los_Angeles');
		expect(r.ok && r.value.map((m) => m.sessionId)).toEqual(['s1', 's2']);
		expect(r.ok && r.value[0]).toMatchObject({
			playedOn: '2026-10-04',
			startTime: '14:00',
			opponent: 'Chippers',
			homeAway: 'away',
			location: 'Chippers home courts',
			label: '2026-10-04 · 14:00 · VS CHIPPERS · AWAY'
		});
		expect(r.ok && r.value[1].location).toBe('BP-1 · Backesto Park');
	});
});
