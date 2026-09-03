import { render } from 'svelte/server';
import { superValidate } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';
import { describe, expect, it, vi } from 'vitest';

// superForm subscribes to SvelteKit's page store, which refuses to be read on the server outside
// a request. These pages are still worth rendering, so the store is stubbed for the render.
// The factories are hoisted, so everything they need is built inside them.
vi.mock('$app/stores', async () => {
	const { readable } = await import('svelte/store');
	const page = readable({
		url: new URL('http://localhost/admin'),
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
	page: { url: new URL('http://localhost/admin'), params: {}, data: {}, form: null },
	navigating: {},
	updated: { current: false }
}));

import { campSchema } from '$lib/server/domain/schedule/camps';
import { classSchema, termSchema } from '$lib/server/domain/schedule/classes';
import { courtSchema, locationSchema } from '$lib/server/domain/schedule/locations';
import { teamSchema, teamSessionSchema } from '$lib/server/domain/schedule/teams';
import Availability from './availability/+page.svelte';
import Camps from './camps/+page.svelte';
import Classes from './classes/+page.svelte';
import TeamDetail from './teams/[id]/+page.svelte';
import Teams from './teams/+page.svelte';

// These pages are thin: the rules live in the schedule domain. What is worth asserting is that
// each one composes its data into something an admin can read — and says so when there is none.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const html = (Component: any, data: any) => render(Component, { props: { data } }).body;

describe('/admin/availability', () => {
	it('lists a venue with its courts and links each to its windows', async () => {
		const out = html(Availability, {
			locations: [
				{
					id: 'loc-1',
					name: 'Murdock Park',
					address: 'Cupertino',
					active: true,
					courts: [{ id: 'c1', locationId: 'loc-1', name: 'MP-1', active: true }]
				}
			],
			loadError: null,
			locationForm: await superValidate(zod4(locationSchema), { id: 'location' }),
			courtForm: await superValidate(zod4(courtSchema), { id: 'court' })
		});
		expect(out).toContain('Murdock Park');
		expect(out).toMatch(/href="\/admin\/availability\/c1"/);
	});

	it('says the academy has no venues rather than showing an empty page', async () => {
		const out = html(Availability, {
			locations: [],
			loadError: null,
			locationForm: await superValidate(zod4(locationSchema), { id: 'location' }),
			courtForm: await superValidate(zod4(courtSchema), { id: 'court' })
		});
		expect(out).toContain('No locations yet');
	});
});

describe('/admin/classes', () => {
	const term = { id: 't1', name: 'Fall 2026', startsOn: '2026-09-07', endsOn: '2026-12-13' };
	const template = {
		id: 'cl1',
		termId: 't1',
		name: 'Green Saturday',
		weekday: 6,
		startTimeLocal: '09:00',
		durationMinutes: 120,
		capacity: 6,
		defaultCourtId: 'c1',
		defaultCoachId: null,
		courtName: 'MP-1',
		coachName: null,
		levelKeys: ['orange']
	};
	const data = async (over: Record<string, unknown> = {}) => ({
		terms: [term],
		termId: 't1',
		classes: [template],
		loadError: null,
		courts: [{ value: 'c1', label: 'MP-1 · Murdock Park' }],
		coaches: [],
		termForm: await superValidate(zod4(termSchema), { id: 'term' }),
		classForm: await superValidate({ termId: 't1' }, zod4(classSchema), {
			id: 'class',
			errors: false
		}),
		...over
	});

	it('shows the term tabs and the template row in academy shorthand', async () => {
		const out = html(Classes, await data());
		expect(out).toContain('Fall 2026');
		expect(out).toContain('Green Saturday');
		expect(out).toContain('SAT');
		expect(out).toContain('09:00');
	});

	it('a term with no classes says so; no terms at all says that instead', async () => {
		expect(html(Classes, await data({ classes: [] }))).toContain('NO CLASSES IN THIS TERM');
		expect(html(Classes, await data({ terms: [], termId: '', classes: [] }))).toContain(
			'No terms yet'
		);
	});
});

describe('/admin/camps and /admin/teams', () => {
	it('camps list their dates and places, and say when there are none', async () => {
		const form = await superValidate(zod4(campSchema));
		const camps = [
			{
				id: 'cp1',
				name: 'Week 1',
				startsOn: '2027-06-14',
				endsOn: '2027-06-18',
				capacity: 24,
				description: null
			}
		];
		const out = html(Camps, { camps, loadError: null, form });
		expect(out).toContain('Week 1');
		expect(out).toContain('2027-06-14');
		expect(html(Camps, { camps: [], loadError: null, form })).toContain('NO CAMPS YET');
	});

	it('teams list by season and link into the roster', async () => {
		const form = await superValidate(zod4(teamSchema));
		const out = html(Teams, {
			teams: [{ id: 'tm1', name: 'Momentum 14U', season: 'Fall 2026', description: null }],
			loadError: null,
			form
		});
		expect(out).toContain('Momentum 14U');
		expect(out).toMatch(/href="\/admin\/teams\/tm1"/);
	});

	it('an empty roster says so, and a search that found nobody says that instead', async () => {
		const base = {
			team: { id: 'tm1', name: 'Momentum 14U', season: 'Fall 2026', description: null },
			query: '',
			roster: [],
			sessions: [],
			candidates: [],
			loadError: null,
			courts: [],
			sessionForm: await superValidate(zod4(teamSessionSchema), { id: 'teamSession' })
		};
		expect(html(TeamDetail, base)).toContain('NO PLAYERS ON THIS TEAM');
		expect(html(TeamDetail, { ...base, query: 'zzz' })).toContain('NO PLAYERS MATCH');
		expect(html(TeamDetail, base)).toContain('NOTHING SCHEDULED');
	});
});
