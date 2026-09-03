// SSR contract tests for app-level composites (built from $lib/ds and the design system's
// ui_kits references). Same discipline as src/lib/ds/ds.test.ts: assert the contract and the
// a11y anatomy, not pixels.
import { render } from 'svelte/server';
import { describe, expect, it } from 'vitest';
import PlayerSwitcher from './PlayerSwitcher.svelte';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const html = (Component: any, props: Record<string, unknown>) => render(Component, { props }).body;

const players = [
	{ id: 'p-1', fullName: 'Maya R.' },
	{ id: 'p-2', fullName: 'Zoe R.' }
];

describe('PlayerSwitcher — the portal-flows.jsx switcher, as links so it works without JS', () => {
	it('is a labelled group with one link per player', () => {
		const out = html(PlayerSwitcher, { players, currentId: 'p-1' });
		expect(out).toContain('role="group"');
		expect(out).toContain('aria-label="Player"');
		expect(out).toContain('Maya R.');
		expect(out).toContain('Zoe R.');
	});

	it('marks the current player, and links change only the query so the path is kept', () => {
		const out = html(PlayerSwitcher, { players, currentId: 'p-1' });
		expect(out).toMatch(/<a[^>]*href="\?player=p-1"[^>]*aria-current="true"/);
		expect(out).toMatch(/<a[^>]*href="\?player=p-2"/);
		expect(out).not.toMatch(/href="\?player=p-2"[^>]*aria-current/);
	});

	it('renders nothing for a single player — there is nothing to switch between', () => {
		const out = html(PlayerSwitcher, { players: [players[0]], currentId: 'p-1' });
		expect(out).not.toContain('role="group"');
	});
});
