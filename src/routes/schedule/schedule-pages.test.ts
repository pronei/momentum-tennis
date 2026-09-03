import { render } from 'svelte/server';
import { describe, expect, it } from 'vitest';
import Portal from '../(portal)/portal/schedule/+page.svelte';
import Public from './+page.svelte';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const html = (Component: any, data: any) => render(Component, { props: { data } }).body;

const days = [
	{
		date: '2026-09-12',
		sessions: [
			{
				id: 's1',
				title: 'Green Saturday',
				type: 'class',
				hours: '09:00–11:00',
				where: 'MP-1 · Murdock Park',
				levelKeys: ['green_beginner']
			}
		]
	},
	{
		date: '2026-09-14',
		sessions: [
			{
				id: 's2',
				title: 'Green Monday',
				type: 'class',
				hours: '16:00–17:30',
				where: 'MP-2 · Murdock Park',
				levelKeys: []
			}
		]
	}
];

describe('/portal/schedule — the family read-only fortnight', () => {
	const base = {
		days,
		from: '2026-09-12',
		loadError: null,
		currentPlayer: { id: 'p1', fullName: 'Maya R.', levelKey: 'green_beginner' }
	};

	it('groups by academy date, oldest first, with times in mono', () => {
		const out = html(Portal, base);
		expect(out.indexOf('2026-09-12')).toBeLessThan(out.indexOf('2026-09-14'));
		expect(out).toContain('09:00–11:00');
		expect(out).toContain('MP-1 · Murdock Park');
	});

	it('names whose schedule it is, and says when a player has no ball level yet', () => {
		expect(html(Portal, base)).toContain('Maya R.');
		expect(
			html(Portal, { ...base, currentPlayer: { ...base.currentPlayer, levelKey: null } })
		).toContain('until the academy sets a ball level');
	});

	it('an empty fortnight says so rather than showing nothing at all', () => {
		expect(html(Portal, { ...base, days: [] })).toContain('Nothing scheduled');
	});

	it('surfaces a failed read', () => {
		expect(html(Portal, { ...base, loadError: 'Sign in to continue.' })).toContain(
			'Sign in to continue.'
		);
	});
});

describe('/schedule — the public page', () => {
	it('carries the class play-by-play, the camp day and the real fortnight', () => {
		const out = html(Public, { days, loadError: null });
		expect(out).toContain('Technical skill training'); // ClassTimeline
		expect(out).toContain('Chess &amp; mental development'); // CampTimeline
		expect(out).toContain('Green Saturday');
		expect(out).toContain('T+0:40');
	});

	it('says nothing is published rather than implying the academy is idle', () => {
		expect(html(Public, { days: [], loadError: null })).toContain('Nothing published');
	});
});
