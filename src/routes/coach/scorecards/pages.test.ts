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
