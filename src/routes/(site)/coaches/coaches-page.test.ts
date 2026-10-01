import { render } from 'svelte/server';
import { describe, expect, it } from 'vitest';
import Page from './+page.svelte';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const html = (data: any) => render(Page, { props: { data } }).body;

const vishal = {
	slug: 'vishal',
	name: 'Vishal',
	role: 'Lead instructor',
	photo: '/coaches/vishal.webp',
	consented: true,
	bio: ['First paragraph.', 'Second paragraph.']
};

describe('/coaches — profiles render only from the published list', () => {
	it('with nobody published it says why, and shows no portrait', () => {
		const out = html({ coaches: [] });
		expect(out).toContain('PROFILES ARRIVE AS RELEASES ARE SIGNED');
		expect(out).not.toContain('<img');
	});

	it('a published coach gets a plain 3:4 portrait, the name, the role in mono and every paragraph', () => {
		const out = html({ coaches: [vishal] });
		expect(out).toContain('src="/coaches/vishal.webp"');
		expect(out).toContain('aspect-ratio: 3 / 4');
		expect(out).not.toContain('mt-photo__img--wash');
		expect(out).toContain('alt="Portrait of Coach Vishal"');
		expect(out).toMatch(/<h2[^>]*>Vishal<\/h2>/);
		expect(out).toContain('Lead instructor');
		expect(out).toContain('First paragraph.');
		expect(out).toContain('Second paragraph.');
	});

	it('a profile without a photo is text alone', () => {
		const out = html({ coaches: [{ ...vishal, photo: null }] });
		expect(out).not.toContain('<img');
		expect(out).toContain('First paragraph.');
	});
});
