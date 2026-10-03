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

const { default: List } = await import('./+page.svelte');

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
