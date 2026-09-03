import { render } from 'svelte/server';
import { describe, expect, it } from 'vitest';
import Page from './+page.svelte';

// The route's own logic lives in query.ts and the schedule domain; this asserts the page
// composes them into the grid the admin actually sees.
const base = {
	localDate: '2026-09-12',
	locationId: 'loc-1',
	today: '2026-09-12',
	heading: '2026-09-12 · SATURDAY',
	prevDate: '2026-09-11',
	nextDate: '2026-09-13',
	locations: [
		{ value: 'loc-1', label: 'Murdock Park' },
		{ value: 'loc-2', label: 'De Anza College' }
	],
	courts: [{ id: 'c1', label: 'MP-1' }],
	sessions: [
		{
			id: 's1',
			court: 'c1',
			start: '09:00',
			end: '11:00',
			type: 'class' as const,
			title: 'Green Saturday',
			coach: 'ARTUR W.',
			cancelled: false
		}
	],
	nowTime: '10:30',
	loadError: null
};
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const html = (data: any) => render(Page as any, { props: { data } }).body;

describe('/admin/schedule — the day grid', () => {
	it('shows the mono date stamp and the session block', () => {
		const out = html(base);
		expect(out).toContain('2026-09-12 · SATURDAY');
		expect(out).toContain('Green Saturday');
		expect(out).toContain('09:00–11:00');
	});

	it('every block is a link, so the grid needs no JavaScript to open a session', () => {
		expect(html(base)).toMatch(/href="\/admin\/schedule\/s1\?location=loc-1&amp;date=2026-09-12"/);
	});

	it('day and venue navigation are links too', () => {
		const out = html(base);
		expect(out).toMatch(/href="\/admin\/schedule\?location=loc-1&amp;date=2026-09-11"/);
		expect(out).toMatch(/href="\/admin\/schedule\?location=loc-2&amp;date=2026-09-12"/);
	});

	it('says what is missing rather than drawing an empty grid', () => {
		expect(html({ ...base, locationId: null, courts: [] })).toContain('No locations yet');
		expect(html({ ...base, courts: [] })).toContain('No active courts');
	});

	it('surfaces a failed read instead of showing a quiet empty day', () => {
		expect(html({ ...base, loadError: 'Only an administrator can do that.' })).toContain(
			'Only an administrator can do that.'
		);
	});
});
