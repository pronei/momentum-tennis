import { render } from 'svelte/server';
import { describe, expect, it, vi } from 'vitest';

vi.mock('$app/stores', async () => {
	const { readable } = await import('svelte/store');
	const page = readable({
		url: new URL('http://localhost/coach/scorecards'),
		params: {},
		route: { id: null },
		status: 200,
		error: null,
		data: {},
		form: null,
		state: {}
	});
	const navigating = readable(null);
	const updated = { subscribe: readable(false).subscribe, check: async () => false };
	return { page, navigating, updated, getStores: () => ({ page, navigating, updated }) };
});
vi.mock('$app/state', () => ({
	page: { url: new URL('http://localhost/coach/scorecards'), params: {}, data: {}, form: null },
	navigating: {},
	updated: { current: false }
}));

import { superValidate } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';
import { headerSchema } from '$lib/server/domain/scorecards/form';

const { default: List } = await import('./+page.svelte');
const { default: New } = await import('./new/+page.svelte');
const { default: Card } = await import('./[id]/+page.svelte');

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const html = (Component: any, data: any, form: any = null) =>
	render(Component, { props: { data, form } }).body;

describe('/coach/scorecards — the list', () => {
	it('lists cards with their status and links each to its page', () => {
		const out = html(List, {
			rows: [
				{
					id: 'c1',
					on: '2026-10-04',
					team: 'Momentum Tennis 12U Green A',
					match: 'at Chippers',
					matchId: '2743978',
					status: 'DRAFT'
				}
			],
			loadError: null
		});
		expect(out).toContain('2743978');
		expect(out).toContain('at Chippers');
		expect(out).toMatch(/href="\/coach\/scorecards\/c1"/);
		expect(out).toMatch(/href="\/coach\/scorecards\/new"/);
	});
	it('says when there are none', () => {
		expect(html(List, { rows: [], loadError: null })).toContain('NO SCORECARDS YET');
	});
});

describe('/coach/scorecards/new — two steps', () => {
	const teams = [{ value: 't1', label: 'Momentum Test 12U Green · Fall 2026' }];
	it('asks for the team first', async () => {
		const out = html(New, {
			teams,
			team: null,
			matches: [],
			sessionId: '',
			form: await superValidate(zod4(headerSchema)),
			loadError: null
		});
		expect(out).toContain('Momentum Test 12U Green · Fall 2026');
		expect(out).toContain('Choose team');
		expect(out).not.toContain('Create card');
	});
	it('then offers the scheduled matches and the header, prefilled', async () => {
		const form = await superValidate(
			{
				teamId: 't1',
				sessionId: 's1',
				playedOn: '2026-10-04',
				startTime: '14:00',
				momentumSide: 'away',
				homeTeam: 'Chippers',
				awayTeam: 'Momentum Test 12U Green',
				location: 'Chippers home courts'
			},
			zod4(headerSchema),
			{ errors: false }
		);
		const out = html(New, {
			teams,
			team: { id: 't1', name: 'Momentum Test 12U Green' },
			matches: [{ value: 's1', label: '2026-10-04 · 14:00 · VS CHIPPERS · AWAY' }],
			sessionId: 's1',
			form,
			loadError: null
		});
		expect(out).toContain('VS CHIPPERS');
		expect(out).toContain('value="Chippers"');
		expect(out).toContain('value="2026-10-04"');
		expect(out).toContain('Create card');
		expect(out).toMatch(/name="teamId"[^>]*value="t1"|value="t1"[^>]*name="teamId"/);
	});
});

describe('/coach/scorecards/[id] — the card', () => {
	const fields = (over: Record<string, string> = {}) => ({
		matchId: '2743978',
		playedOn: '2026-10-04',
		startTime: '14:00',
		division: '12U Green',
		homeTeam: 'Chippers',
		awayTeam: 'Momentum Test 12U Green',
		location: '',
		momentumSide: 'away',
		format: 'three_court',
		setGames: '6',
		homeSportsmanship: '',
		awaySportsmanship: '',
		notes: '',
		'1S_home1': 'Theo B.',
		'1S_away1': 'Ada Lovelace',
		'1S_hg': '4',
		'1S_ag': '6',
		'1S_result': '',
		'1S_winner': '',
		...over
	});
	const card = (over: Record<string, unknown> = {}) => ({
		id: 'c1',
		status: 'draft',
		matchId: '2743978',
		playedOn: '2026-10-04',
		teamName: 'Momentum Test 12U Green',
		title: 'Chippers vs Momentum Test 12U Green',
		finalizedOn: null,
		...over
	});
	const data = (over: Record<string, unknown> = {}) => ({
		card: card(),
		rounds: [
			{
				round: 1,
				lines: [
					{ position: '1S', label: '#1 SINGLES', doubles: false },
					{ position: '4D', label: '#4 DOUBLES', doubles: true }
				]
			},
			{ round: 2, lines: [{ position: '3S', label: '#3 SINGLES', doubles: false }] }
		],
		fields: fields(),
		suggestions: ['Ada Lovelace', 'Grace Hopper'],
		totals: { home: 4, away: 6 },
		readiness: ['#4 DOUBLES · NO SCORE'],
		results: [
			{ value: 'completed', label: 'Completed' },
			{ value: 'timed', label: 'Timed match' }
		],
		isAdmin: false,
		loadError: null,
		...over
	});

	it('groups the lines by round, suggests the roster on Momentum’s side only, and shows readiness', () => {
		const out = html(Card, data());
		expect(out).toContain('Round 1'); // the eyebrow uppercases in CSS
		expect(out).toContain('#1 SINGLES');
		expect(out).toContain('value="Theo B."');
		expect(out).toContain('value="Ada Lovelace"');
		expect(out).toMatch(/name="1S_away1"[^>]*list=|list=[^>]*name="1S_away1"/);
		expect(out).not.toMatch(/name="1S_home1"[^>]*list=/);
		expect(out).toContain('name="4D_home2"');
		expect(out).not.toContain('name="1S_home2"');
		expect(out).toContain('GAMES WON · CHIPPERS 4 · MOMENTUM TEST 12U GREEN 6');
		expect(out).toContain('#4 DOUBLES · NO SCORE');
		expect(out).toContain('formaction="?/finalize"');
		expect(out).not.toContain('Export JSON');
	});
	it('renders a final card read-only with the export, and the reopen for an admin', () => {
		const out = html(
			Card,
			data({
				card: card({ status: 'final', finalizedOn: '2026-10-04' }),
				readiness: [],
				isAdmin: true
			})
		);
		expect(out).toMatch(/href="\/coach\/scorecards\/c1\/export"/);
		expect(out).toContain('action="?/reopen"');
		expect(out).not.toContain('formaction="?/finalize"');
		expect(out).toMatch(/name="1S_hg"[^>]*disabled/);
	});
	it('keeps a failed submission on screen with its errors', () => {
		const out = html(Card, data(), {
			fields: fields({ '1S_hg': '9' }),
			errors: { '1S_hg': '0 to 7' },
			saveError: 'Check the highlighted fields.'
		});
		expect(out).toContain('value="9"');
		expect(out).toContain('ERROR: 0 to 7');
		expect(out).toContain('Check the highlighted fields.');
	});
});
