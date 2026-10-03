// SSR contract tests for app-level composites (built from $lib/ds and the design system's
// ui_kits references). Same discipline as src/lib/ds/ds.test.ts: assert the contract and the
// a11y anatomy, not pixels.
import { render } from 'svelte/server';
import { describe, expect, it } from 'vitest';
import NameField from './NameField.svelte';
import PlayerSwitcher from './PlayerSwitcher.svelte';
import ScoreField from './ScoreField.svelte';

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

describe('NameField — a typed name with the roster as suggestions', () => {
	it('labels the input, offers the roster as a datalist, and needs no JavaScript', () => {
		const out = html(NameField, {
			label: 'Player 1',
			name: '1S_home1',
			value: 'Ada',
			suggestions: ['Ada Lovelace', 'Grace Hopper']
		});
		expect(out).toMatch(/<label[^>]*for="([^"]+)"[^>]*>Player 1<\/label>/);
		expect(out).toContain('name="1S_home1"');
		expect(out).toContain('value="Ada"');
		expect(out).toMatch(/<datalist id="[^"]+-list">/);
		expect(out).toContain('<option value="Ada Lovelace">');
	});
	it('carries the dual-channel error', () => {
		const out = html(NameField, { label: 'Player 1', name: 'x', error: 'Too long' });
		expect(out).toContain('ERROR: Too long');
		expect(out).toContain('aria-invalid="true"');
	});
	it('omits the datalist when there is nothing to suggest', () => {
		expect(html(NameField, { label: 'Player 1', name: 'x' })).not.toContain('<datalist');
	});
});

describe('ScoreField — one games box', () => {
	it('is a one-digit numeric box bound to its name', () => {
		const out = html(ScoreField, { label: 'Games', name: '1S_hg', value: '6' });
		expect(out).toContain('inputmode="numeric"');
		expect(out).toContain('maxlength="1"');
		expect(out).toContain('name="1S_hg"');
		expect(out).toContain('value="6"');
	});
	it('renders disabled on a final card', () => {
		expect(html(ScoreField, { label: 'Games', name: 'x', disabled: true })).toContain('disabled');
	});
});
