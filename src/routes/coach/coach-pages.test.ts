import { render } from 'svelte/server';
import { describe, expect, it, vi } from 'vitest';

vi.mock('$app/state', () => ({
	page: { url: new URL('http://localhost/coach/sessions'), params: {}, data: {}, form: null },
	navigating: {},
	updated: { current: false }
}));

const { default: Sessions } = await import('./sessions/+page.svelte');
const { default: Attendance } = await import('./sessions/[id]/+page.svelte');

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const html = (Component: any, data: any, form: any = null) =>
	render(Component, { props: { data, form } }).body;

describe('/coach/sessions — the day', () => {
	const data = (sessions: unknown[]) => ({
		localDate: '2026-09-14',
		today: '2026-09-14',
		heading: '2026-09-14 · MONDAY',
		prevDate: '2026-09-13',
		nextDate: '2026-09-15',
		sessions,
		loadError: null
	});

	it('lists the day in start order and links each session to its register', () => {
		const out = html(
			Sessions,
			data([
				{
					id: 's1',
					type: 'class',
					title: 'Green Monday',
					hours: '16:00–17:30',
					where: 'MP-1 · Murdock Park'
				}
			])
		);
		expect(out).toContain('2026-09-14 · MONDAY');
		expect(out).toContain('16:00–17:30');
		expect(out).toMatch(/href="\/coach\/sessions\/s1"/);
	});

	it('says a quiet day is quiet', () => {
		expect(html(Sessions, data([]))).toContain('Nothing scheduled on this day');
	});
});

describe('/coach/sessions/[id] — the register', () => {
	const session = (over: Record<string, unknown> = {}) => ({
		id: 's1',
		title: 'Green Monday',
		date: '2026-09-14',
		hours: '16:00–17:30',
		where: 'MP-1 · Murdock Park',
		cancelled: false,
		ended: false,
		...over
	});
	const data = (roster: unknown[], over: Record<string, unknown> = {}) => ({
		session: session(),
		roster,
		loadError: null,
		...over
	});
	const player = (over: Record<string, unknown> = {}) => ({
		playerId: 'p1',
		fullName: 'Maya R.',
		bookingId: 'b1',
		status: 'booked',
		present: null,
		...over
	});

	it('counts what has been marked, and offers both answers per player', () => {
		const out = html(
			Attendance,
			data([player(), player({ playerId: 'p2', fullName: 'Zoe R.', present: true })])
		);
		expect(out).toContain('MARKED 1 OF 2');
		expect(out).toContain('Maya R.');
		expect(out).toContain('NOT MARKED');
		expect(out).toContain('PRESENT');
	});

	it('offers settlement only once the session has ended', () => {
		expect(html(Attendance, data([player()]))).not.toContain('Settle ended sessions');
		expect(html(Attendance, data([player()], { session: session({ ended: true }) }))).toContain(
			'Settle ended sessions'
		);
	});

	it('says when nobody is booked', () => {
		expect(html(Attendance, data([]))).toContain('Nobody is booked');
	});

	it('surfaces a refused mark', () => {
		expect(
			html(Attendance, data([player()]), { markError: 'Only academy staff can do that.' })
		).toContain('Only academy staff can do that.');
	});
});
