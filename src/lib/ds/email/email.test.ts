import { describe, expect, it } from 'vitest';
import { bookingConfirmation } from './bookingConfirmation';

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
