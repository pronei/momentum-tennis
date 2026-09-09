import { describe, expect, it } from 'vitest';
import { bookingConfirmation } from './bookingConfirmation';
import { paymentReceipt } from './paymentReceipt';

const b = {
	playerName: 'Maya R.',
	title: 'Green Saturday',
	date: '2026-09-12',
	weekday: 'sat',
	hours: '09:00–11:00',
	location: 'Murdock Park',
	coach: 'Artur W.',
	creditsLeft: 6,
	bookingUrl: 'https://example.test/portal/bookings'
};

describe('bookingConfirmation — the transactional template', () => {
	it('names the session and the academy-time stamp in the subject', () => {
		const { subject } = bookingConfirmation(b);
		expect(subject).toContain('Green Saturday');
		expect(subject).toContain('2026-09-12');
		expect(subject).toContain('09:00–11:00');
	});

	it('the text version loses none of the facts the HTML carries', () => {
		const { text } = bookingConfirmation(b);
		for (const fact of [
			'Green Saturday',
			'2026-09-12',
			'SAT',
			'09:00–11:00',
			'Murdock Park',
			'Maya R.',
			'Artur W.',
			'6 remaining'
		]) {
			expect(text).toContain(fact);
		}
		expect(text).toContain('https://example.test/portal/bookings');
	});

	it('omits the coach line when there is no coach, rather than printing an empty one', () => {
		const { text, html } = bookingConfirmation({ ...b, coach: null });
		expect(text).not.toContain('COACH');
		expect(html).not.toContain('COACH');
	});

	it('escapes what it interpolates — a player name is not markup', () => {
		const { html } = bookingConfirmation({ ...b, playerName: 'A <b>& "B"' });
		expect(html).toContain('A &lt;b&gt;&amp; &quot;B&quot;');
		expect(html).not.toContain('<b>&');
	});

	it('carries no script and no remote image', () => {
		const { html } = bookingConfirmation(b);
		expect(html).not.toMatch(/<script/i);
		expect(html).not.toMatch(/<img/i);
	});
});

const r = {
	orderRef: 'ORDER 3F2A9C1B',
	items: [{ name: 'Weekday classes', playerName: 'Eli W.', amount: '$500.00' }],
	total: '$500.00',
	date: '2026-09-05',
	creditsLine: '10 CREDITS ISSUED · ELI W. · EXPIRES 2026-12-05',
	stripeRef: 'PI_FAKE_3F2A9C1B',
	receiptUrl: 'https://example.test/portal/purchases/3f2a9c1b'
};

describe('paymentReceipt — what a family keeps when money moved', () => {
	it('names the item and the amount in the subject', () => {
		expect(paymentReceipt(r).subject).toBe('Receipt — Weekday classes · $500.00');
	});

	it('the text version loses none of the facts the HTML carries', () => {
		const { text, html } = paymentReceipt(r);
		for (const fact of [
			'Weekday classes',
			'Eli W.',
			'$500.00',
			'2026-09-05',
			'ORDER 3F2A9C1B',
			'10 CREDITS ISSUED · ELI W. · EXPIRES 2026-12-05',
			'PI_FAKE_3F2A9C1B',
			'https://example.test/portal/purchases/3f2a9c1b'
		]) {
			expect(text).toContain(fact);
			expect(html).toContain(fact);
		}
	});

	it('carries the amber pill and the footer the reference prints', () => {
		const { html } = paymentReceipt(r);
		expect(html).toContain('View receipt');
		expect(html).toContain('#E8A33D');
		expect(html).toContain('border-radius:999px');
		expect(html).toContain(
			'YOU RECEIVED THIS BECAUSE A PAYMENT WAS MADE ON YOUR MOMENTUM TENNIS ACCOUNT.'
		);
		expect(html).toContain('MOMENTUM TENNIS · CUPERTINO, CA · 669-264-6756');
	});

	it('omits the credits and Stripe rows rather than printing empty ones', () => {
		const { text, html } = paymentReceipt({ ...r, creditsLine: null, stripeRef: null });
		expect(text).not.toContain('CREDITS ISSUED');
		expect(html).not.toContain('CREDITS ISSUED');
		expect(text).not.toContain('STRIPE REF');
		expect(html).not.toContain('STRIPE REF');
	});

	it('escapes what it interpolates, carries no script and no remote image, and never shouts', () => {
		const { html, text, subject } = paymentReceipt({
			...r,
			items: [{ name: 'A <b>& "B"', playerName: 'Eli W.', amount: '$1.00' }]
		});
		expect(html).toContain('A &lt;b&gt;&amp; &quot;B&quot;');
		expect(html).not.toMatch(/<script/i);
		expect(html).not.toMatch(/<img/i);
		// no exclamation points in the copy; the doctype's is the only one the document may hold
		for (const s of [html.replace('<!DOCTYPE html>', ''), text, subject])
			expect(s).not.toContain('!');
	});
});
