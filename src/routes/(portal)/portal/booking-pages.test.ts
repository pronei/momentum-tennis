import { render } from 'svelte/server';
import { describe, expect, it } from 'vitest';
import Book from './book/+page.svelte';
import Bookings from './bookings/+page.svelte';
import Credits from './credits/+page.svelte';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const html = (Component: any, data: any, form: any = null) =>
	render(Component, { props: { data, form } }).body;

const player = { id: 'p1', fullName: 'Maya R.', levelKey: 'green_intermediate' };
const wallet = [
	{ creditKind: 'class_weekday', balance: 3, nextExpiry: null },
	{ creditKind: 'class_weekend', balance: 0, nextExpiry: null },
	{ creditKind: 'private_lesson', balance: 0, nextExpiry: null }
];
const session = (over: Record<string, unknown> = {}) => ({
	id: 's1',
	title: 'Green Monday',
	hours: '16:00–17:30',
	where: 'MP-1 · Murdock Park',
	scope: 'weekday',
	seatsLeft: 2,
	waitlisted: 0,
	alreadyBooked: false,
	weekBlocked: false,
	...over
});
const bookData = (sessions: Record<string, unknown>[], over: Record<string, unknown> = {}) => ({
	currentPlayer: player,
	settings: {
		timezone: 'America/Los_Angeles',
		bookingHorizonDays: 70,
		cancelNoticeHours: 24,
		lowCreditThreshold: 2
	},
	days: sessions.length ? [{ date: '2026-09-14', sessions }] : [],
	balances: wallet,
	loadError: null,
	...over
});

describe('/portal/book — what this player may take, and why not', () => {
	it('offers a seat count on a session with room', () => {
		const out = html(Book, bookData([session()]));
		expect(out).toContain('Green Monday');
		expect(out).toContain('Book · 2 left');
	});

	it('offers the waitlist instead when the class is full', () => {
		const out = html(Book, bookData([session({ seatsLeft: 0, waitlisted: 3 })]));
		expect(out).toContain('Join waitlist');
		expect(out).not.toContain('Book · ');
	});

	it('explains the weekly cap rather than offering a button that would be refused', () => {
		const out = html(Book, bookData([session({ weekBlocked: true })]));
		expect(out).toContain('WEEKDAY CLASS ALREADY BOOKED THIS WEEK');
		expect(out).not.toContain('Join waitlist');
	});

	it('shows a session already held as held, with no second Book', () => {
		const out = html(Book, bookData([session({ alreadyBooked: true })]));
		expect(out).not.toContain('Book · ');
	});

	it('says there are no credits, and where they come from', () => {
		const out = html(
			Book,
			bookData([session()], { balances: wallet.map((b) => ({ ...b, balance: 0 })) })
		);
		expect(out).toContain('No class credits yet');
	});

	it('shows a refusal from the database in its own words', () => {
		const out = html(Book, bookData([session()]), {
			bookError: 'One weekday or weekend class per week per package. This week already has one.'
		});
		expect(out).toContain('This week already has one');
	});

	it('asks for a player before anything else', () => {
		expect(html(Book, bookData([], { currentPlayer: null }))).toContain('Add a player first');
	});
});

describe('/portal/bookings — the rule before the confirm', () => {
	const booking = (over: Record<string, unknown> = {}) => ({
		id: 'b1',
		status: 'booked',
		sessionCancelled: false,
		date: '2026-09-14',
		hours: '16:00–17:30',
		notice: 'free',
		waitlistPosition: null,
		...over
	});
	const data = (over: Record<string, unknown> = {}) => ({
		currentPlayer: player,
		settings: {
			timezone: 'America/Los_Angeles',
			bookingHorizonDays: 70,
			cancelNoticeHours: 24,
			lowCreditThreshold: 2
		},
		upcoming: [booking()],
		past: [],
		loadError: null,
		...over
	});

	it('states that the credit returns when there is still notice', () => {
		expect(html(Bookings, data())).toContain('CANCEL NOW AND THE CREDIT RETURNS');
	});

	it('states the forfeit inside the notice window', () => {
		expect(html(Bookings, data({ upcoming: [booking({ notice: 'late' })] }))).toContain(
			'INSIDE THE NOTICE WINDOW'
		);
	});

	it('shows a waitlisted booking with its position instead of a cancellation rule', () => {
		const out = html(
			Bookings,
			data({ upcoming: [booking({ status: 'waitlisted', waitlistPosition: 2 })] })
		);
		expect(out).toContain('POSITION 2');
	});

	it('reports what a cancellation actually did', () => {
		const out = html(Bookings, data(), { cancelled: 'cancelled', forgiven: false, promoted: 1 });
		expect(out).toContain('the credit is back');
		expect(out).toContain('1 player promoted from the waitlist');
	});

	it('says the forfeit and the forgiveness when the cancel was late', () => {
		const out = html(Bookings, data(), {
			cancelled: 'cancelled_late',
			forgiven: true,
			promoted: 0
		});
		expect(out).toContain('the credit was forfeited');
		expect(out).toContain('forgiven skip was used');
	});

	it('points an empty list at the booking page', () => {
		expect(html(Bookings, data({ upcoming: [] }))).toContain('NOTHING BOOKED');
	});
});

describe('/portal/credits — the number and the history behind it', () => {
	const data = (over: Record<string, unknown> = {}) => ({
		currentPlayer: player,
		lowThreshold: 2,
		balances: [
			{
				creditKind: 'class_weekday',
				balance: 3,
				nextExpiry: null,
				label: 'Weekday classes',
				expiresOn: '2026-11-20'
			},
			{
				creditKind: 'class_weekend',
				balance: 0,
				nextExpiry: null,
				label: 'Weekend classes',
				expiresOn: null
			}
		],
		entries: [
			{
				id: 'l1',
				movement: '+10',
				entryType: 'adjust',
				kind: 'Weekday classes',
				reason: 'Trial pack',
				on: '2026-09-01'
			},
			{
				id: 'l2',
				movement: '-1',
				entryType: 'consume',
				kind: 'Weekday classes',
				reason: null,
				on: '2026-09-14'
			}
		],
		loadError: null,
		...over
	});

	it('shows a balance per kind with its next expiry', () => {
		const out = html(Credits, data());
		expect(out).toContain('Weekday classes');
		expect(out).toContain('NEXT EXPIRY 2026-11-20');
		expect(out).toContain('NOTHING EXPIRING');
	});

	it('keeps the sign of every ledger movement', () => {
		const out = html(Credits, data());
		expect(out).toContain('+10');
		expect(out).toContain('-1');
	});

	it('surfaces a refused read — a minor own login sees the refusal, not a zero', () => {
		expect(
			html(Credits, data({ loadError: 'This account cannot act for that player.' }))
		).toContain('This account cannot act for that player.');
	});
});
