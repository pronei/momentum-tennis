// SSR contract tests for the design-system ports. They assert the props contracts from
// design-system/components/**/*.d.ts and the a11y anatomy (dual-channel errors, roles, ids) —
// not pixels. Rendered with svelte/server so no browser is needed.
import { createRawSnippet } from 'svelte';
import { render } from 'svelte/server';
import { describe, expect, it } from 'vitest';
import {
	Banner,
	Button,
	CampTimeline,
	Checkbox,
	ClassTimeline,
	DataTable,
	Dialog,
	EmptyState,
	Eyebrow,
	FormSection,
	FrameTicks,
	Pagination,
	ResourceDayView,
	SegmentedControl,
	Select,
	SessionForm,
	StatusChip,
	Tabs,
	TextArea,
	TextField,
	Toast
} from '$lib/ds';

const text = (s: string) => createRawSnippet(() => ({ render: () => `<span>${s}</span>` }));
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const html = (Component: any, props: Record<string, unknown>) => render(Component, { props }).body;

describe('Button — the action pill', () => {
	it('renders a primary pill button by default', () => {
		const out = html(Button, { children: text('Book a free trial class') });
		const cls = /<button[^>]*class="([^"]*)"/.exec(out)?.[1] ?? '';
		expect(cls.split(/\s+/)).toEqual(expect.arrayContaining(['mt-btn', 'mt-btn--primary']));
		expect(out).toContain('type="button"');
	});
	it('renders an anchor when href is set, carrying aria-disabled instead of disabled', () => {
		const out = html(Button, { href: '/book', disabled: true, children: text('Book') });
		expect(out).toMatch(/<a[^>]*href="\/book"/);
		expect(out).toContain('aria-disabled="true"');
	});
	it('exposes size and field modifiers as classes', () => {
		const out = html(Button, { size: 'sm', onField: true, variant: 'ghost', children: text('x') });
		expect(out).toMatch(/mt-btn--ghost/);
		expect(out).toMatch(/mt-btn--sm/);
		expect(out).toMatch(/mt-btn--field/);
	});
});

describe('Eyebrow + FrameTicks', () => {
	it('leads with frame ticks when asked', () => {
		expect(html(Eyebrow, { ticks: true, children: text('Player portal') })).toMatch(/mt-ticks/);
	});
	it('FrameTicks is decorative unless loading, when it becomes a status', () => {
		expect(html(FrameTicks, {})).toContain('aria-hidden="true"');
		const loading = html(FrameTicks, { loading: true });
		expect(loading).toContain('role="status"');
		expect(loading).toContain('aria-label="Loading"');
	});
	it('renders count frames', () => {
		expect(html(FrameTicks, { count: 3 }).match(/mt-tick\b/g)?.length).toBe(3);
	});
});

describe('form anatomy — label, help, dual-channel error, described-by wiring', () => {
	it('TextField error renders ERROR: prefix, role=alert, aria-invalid and links via aria-describedby', () => {
		const out = html(TextField, {
			label: 'Guardian email',
			error: 'enter a full email address',
			name: 'email'
		});
		expect(out).toContain('aria-invalid="true"');
		expect(out).toMatch(/role="alert"[^>]*>ERROR: enter a full email address/);
		const id = /aria-describedby="([^"]+)"/.exec(out)?.[1];
		expect(id).toBeTruthy();
		expect(out).toContain(`id="${id}"`);
	});
	it('TextField without error has no alert and no aria-invalid', () => {
		const out = html(TextField, { label: 'Name', name: 'name' });
		expect(out).not.toContain('role="alert"');
		expect(out).not.toContain('aria-invalid');
	});
	it('Select renders a disabled placeholder option and option labels', () => {
		const out = html(Select, {
			label: 'Player',
			placeholder: 'Choose a player',
			options: [{ value: 'a', label: 'Maya R.' }, 'Zoe R.'],
			name: 'player'
		});
		expect(out).toMatch(/<option[^>]*disabled[^>]*>Choose a player/);
		expect(out).toContain('Maya R.');
		expect(out).toContain('value="Zoe R."');
	});
	it('Checkbox is a frame that fills; consent variant is the large frame', () => {
		expect(html(Checkbox, { label: 'Present', checked: true, name: 'p' })).toMatch(
			/<input[^>]*checked/
		);
		expect(html(Checkbox, { label: 'I agree', consent: true })).toMatch(/mt-check--consent/);
	});
	it('SegmentedControl is a radiogroup with aria-checked and a hidden input for native forms', () => {
		const out = html(SegmentedControl, {
			label: 'Visibility',
			options: [
				{ value: 'guardian', label: 'Visible to family' },
				{ value: 'internal', label: 'Internal' }
			],
			value: 'internal',
			name: 'visibility'
		});
		expect(out).toContain('role="radiogroup"');
		expect(out).toMatch(
			/role="radio"[^>]*aria-checked="true"[^>]*>[^<]*Internal|Internal[^<]*<\/button>/
		);
		expect(out).toMatch(/<input[^>]*type="hidden"[^>]*name="visibility"[^>]*value="internal"/);
	});
	it('TextArea and FormSection carry the shared anatomy', () => {
		expect(html(TextArea, { label: 'Notes', help: 'Coaches see this', name: 'n' })).toContain(
			'Coaches see this'
		);
		const section = html(FormSection, {
			eyebrow: 'Parent — account owner',
			children: text('fields')
		});
		expect(section).toContain('Parent — account owner');
		expect(section).toContain('fields');
	});
});

describe('feedback', () => {
	it('Banner error is role=alert with the ERROR: prefix; note is role=status', () => {
		expect(html(Banner, { tone: 'error', children: text('waiver required') })).toMatch(
			/role="alert"[\s\S]*ERROR:/
		);
		expect(html(Banner, { children: text('saved') })).toMatch(/role="status"[\s\S]*NOTE:/);
	});
	it('StatusChip upper-cases and renders a swatch; unknown statuses get a frame', () => {
		expect(html(StatusChip, { status: 'active' })).toContain('ACTIVE');
		expect(html(StatusChip, { status: 'whatever' })).toMatch(/mt-chip__swatch--frame/);
	});
	it('EmptyState renders the mono line and optional ticks', () => {
		const out = html(EmptyState, { ticks: true, children: text('NO SESSIONS') });
		expect(out).toContain('NO SESSIONS');
		expect(out).toMatch(/mt-ticks/);
	});
	it('Tabs mark the active tab with aria-current and render links when items have hrefs', () => {
		const out = html(Tabs, {
			items: [
				{ id: 'stats', label: 'Stats', href: '/portal' },
				{ id: 'calendar', label: 'Calendar', href: '/portal/calendar' }
			],
			active: 'calendar'
		});
		expect(out).toMatch(/<a[^>]*href="\/portal\/calendar"[^>]*aria-current="page"/);
		expect(out).not.toMatch(/<a[^>]*href="\/portal"[^>]*aria-current/);
	});
	it('Pagination shows a zero-padded counter and disables the ends', () => {
		const out = html(Pagination, { page: 1, pages: 4 });
		expect(out).toContain('01 / 04');
		expect(out).toMatch(
			/aria-label="Previous page"[^>]*disabled|disabled[^>]*aria-label="Previous page"/
		);
	});
	it('Dialog renders a native dialog with the title and consequence line', () => {
		const out = html(Dialog, {
			open: true,
			title: 'Cancel booking',
			consequence: 'THE CREDIT IS FORFEITED',
			children: text('body')
		});
		expect(out).toMatch(/<dialog/);
		expect(out).toContain('Cancel booking');
		expect(out).toContain('THE CREDIT IS FORFEITED');
	});
	it('Toast is a status region', () => {
		expect(html(Toast, { open: true, children: text('SAVED · 16:04') })).toMatch(
			/role="status"[\s\S]*SAVED · 16:04/
		);
	});
});

describe('DataTable — the admin list', () => {
	const columns = [
		{ key: 'name', label: 'Class', sortable: true },
		{ key: 'when', label: 'When', mono: true },
		{ key: 'seats', label: 'Seats', numeric: true, sortable: true }
	];
	const rows = [{ name: 'Green Saturday', when: 'SAT 09:00', seats: 6 }];

	it('marks the sorted column with aria-sort and keeps the others unmarked', () => {
		const out = html(DataTable, { columns, rows, sort: { key: 'seats', dir: 'desc' } });
		expect(out).toMatch(/<th[^>]*aria-sort="descending"/);
		expect(out.match(/aria-sort=/g)).toHaveLength(1);
	});

	it('sets numeric cells in mono so columns of figures line up', () => {
		const out = html(DataTable, { columns, rows });
		expect(out).toMatch(/class="[^"]*mt-dt__cell--num/);
	});

	it('sorting and paging are links, so the list works without JavaScript', () => {
		const out = html(DataTable, {
			columns,
			rows,
			page: 2,
			pages: 4,
			sortHref: (key: string, dir: string) => `?sort=${key}&dir=${dir}`,
			pageHref: (page: number) => `?page=${page}`
		});
		expect(out).toMatch(/<a[^>]*href="\?sort=seats&amp;dir=asc"/);
		expect(out).toMatch(/<a[^>]*href="\?page=3"/);
	});

	it('renders the mono empty line instead of an empty table', () => {
		const out = html(DataTable, { columns, rows: [], empty: 'NO CLASSES YET' });
		expect(out).toContain('NO CLASSES YET');
	});

	it('carries the ≤760px card collapse in the markup, not behind a media listener', () => {
		const out = html(DataTable, { columns, rows });
		expect(out).toMatch(/mt-dt__cards/);
	});
});

describe('ResourceDayView — the day grid', () => {
	const courts = [
		{ id: 'c1', label: 'MP-1' },
		{ id: 'c2', label: 'MP-2' }
	];
	const sessions = [
		{
			id: 's1',
			court: 'c1',
			start: '09:00',
			end: '11:00',
			type: 'class' as const,
			title: 'Green Saturday'
		},
		{
			id: 's2',
			court: 'c2',
			start: '16:00',
			end: '17:30',
			type: 'team' as const,
			title: 'Momentum 14U',
			cancelled: true
		}
	];

	it('draws one column per court and one block per session', () => {
		const out = html(ResourceDayView, { date: '2026-09-12 · SATURDAY', courts, sessions });
		expect(out.match(/data-court="/g)).toHaveLength(2);
		expect(out.match(/data-session="/g)).toHaveLength(2);
		expect(out).toContain('2026-09-12 · SATURDAY');
	});

	it('positions blocks with custom properties — no JavaScript layout pass', () => {
		const out = html(ResourceDayView, { courts, sessions, startHour: 7, rowH: 44 });
		expect(out).toMatch(/--top:\s*88px/); // 09:00 is two hours past 07:00
		expect(out).toMatch(/--height:\s*86px/); // two hours less the 2px gutter
	});

	it('strikes a cancelled session and says so in the mono label', () => {
		const out = html(ResourceDayView, { courts, sessions });
		expect(out).toMatch(/mt-rdv__block--cancelled/);
		expect(out).toContain('CANCELLED');
	});

	it('shows a refused draft as a dual-channel ERROR line', () => {
		const out = html(ResourceDayView, {
			courts,
			sessions,
			draft: { court: 'c1', start: '09:00', end: '10:00', conflict: 'COURT 1 BOOKED 09:00–11:00' }
		});
		expect(out).toMatch(/role="alert"/);
		expect(out).toContain('ERROR: COURT 1 BOOKED 09:00–11:00');
	});

	it('draws the amber now line only when a time is given', () => {
		expect(html(ResourceDayView, { courts, sessions })).not.toMatch(/mt-rdv__now/);
		const out = html(ResourceDayView, { courts, sessions, nowTime: '10:30' });
		expect(out).toMatch(/mt-rdv__now/);
		expect(out).toContain('NOW 10:30');
	});
});

describe('SessionForm — the session fields', () => {
	const courts = [{ id: 'c1', label: 'MP-1' }];
	const coaches = [{ id: 'a1', label: 'Artur W.' }];

	it('renders the whole control set the contract names', () => {
		const out = html(SessionForm, { courts, coaches });
		expect(out).toMatch(/role="radiogroup"/); // type SegmentedControl
		expect(out.match(/<select/g)?.length).toBeGreaterThanOrEqual(2); // court + coach
		expect(out.match(/name="start"|name="end"/g)).toHaveLength(2);
		expect(out).toMatch(/<textarea/);
		expect(out).toMatch(/name="date"/);
	});

	it('shows a conflict as an error Banner and refuses to submit', () => {
		const out = html(SessionForm, {
			courts,
			coaches,
			conflict: 'COURT 1 BOOKED 09:00–11:00 — PICK ANOTHER SLOT'
		});
		expect(out).toMatch(/role="alert"/);
		expect(out).toContain('COURT 1 BOOKED 09:00–11:00 — PICK ANOTHER SLOT');
		expect(out).toMatch(/<button[^>]*type="submit"[^>]*disabled/);
	});
});

describe('the site timelines', () => {
	it('ClassTimeline runs three blocks and offsets them by the variant length', () => {
		const weekend = html(ClassTimeline, {});
		expect(weekend).toContain('T+0:40');
		expect(weekend).toContain('T+1:20');
		expect(weekend).toContain('40 MIN');
		const weekday = html(ClassTimeline, { variant: 'weekday' });
		expect(weekday).toContain('T+0:30');
		expect(weekday).toContain('T+1:00');
		expect(weekday).toContain('30 MIN');
	});

	it('ClassTimeline names the three blocks in order', () => {
		const out = html(ClassTimeline, {});
		expect(out.indexOf('Technical skill training')).toBeLessThan(out.indexOf('Dynamic drills'));
		// '&' arrives escaped in the markup, so the search stops at the word
		expect(out.indexOf('Dynamic drills')).toBeLessThan(out.indexOf('Gameplay'));
	});

	it('CampTimeline numbers the day frames in order', () => {
		const out = html(CampTimeline, {});
		expect(out).toContain('09:00');
		expect(out.indexOf('>01<')).toBeLessThan(out.indexOf('>05<'));
	});

	it('CampTimeline takes an override list', () => {
		const out = html(CampTimeline, {
			items: [{ time: '08:30', title: 'Warm-up', phase: 'On court' }]
		});
		expect(out).toContain('08:30');
		expect(out).toContain('Warm-up');
		expect(out).not.toContain('Chess');
	});
});
