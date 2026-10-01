import { describe, expect, it } from 'vitest';
import { COACHES, publishedCoaches } from './coaches';
import { PHOTOS, publishedPhotos } from './photos';
import { SITE_STATS } from './site';
import { SPONSORS } from './sponsors';

// The content modules stand in for an admin console (PRODUCT.md §12). These tests keep them
// honest: every file they name is in static/, and nothing unconsented can reach a page.
// Vite lists the files when it transforms this module; nothing is imported.
const STATIC = new Set(
	Object.keys(import.meta.glob('/static/**/*.{webp,svg}')).map((k) => k.replace(/^\/static/, ''))
);
const exists = (src: string) => STATIC.has(src);

describe('coaches', () => {
	it('names every coach with a role, a bio and a consent flag, Artur first', () => {
		expect(COACHES[0].slug).toBe('artur-westergren');
		for (const c of COACHES) {
			expect(c.name).toBeTruthy();
			expect(c.role).toBeTruthy();
			expect(c.bio.length).toBeGreaterThan(0);
			expect(typeof c.consented).toBe('boolean');
		}
		expect(COACHES.map((c) => c.slug)).toEqual([
			'artur-westergren',
			'vishal',
			'tom-anderson',
			'surya',
			'zach',
			'matthew'
		]);
	});

	it('every portrait named is in static/', () => {
		for (const c of COACHES) if (c.photo) expect(exists(c.photo), c.photo).toBe(true);
	});

	it('publishes only the consented, and keeps their order', () => {
		const withdrawn = COACHES.map((c, i) => ({ ...c, consented: i !== 1 }));
		expect(publishedCoaches(withdrawn).map((c) => c.slug)).not.toContain(COACHES[1].slug);
		expect(publishedCoaches(withdrawn)[0].slug).toBe('artur-westergren');
		expect(publishedCoaches()).toEqual(COACHES.filter((c) => c.consented));
	});

	it('the bios carry no exclamation point — the voice is plain', () => {
		for (const c of COACHES) for (const p of c.bio) expect(p).not.toContain('!');
	});
});

describe('photos', () => {
	it('every photo is in static/, measured, cropped, focused and described', () => {
		expect(PHOTOS.length).toBeGreaterThan(6);
		for (const p of PHOTOS) {
			expect(exists(p.src), p.src).toBe(true);
			expect(p.width).toBeGreaterThan(0);
			expect(p.height).toBeGreaterThan(0);
			expect(['3:2', '4:3', '1:1', '16:9', '3:4', '2:3']).toContain(p.ratio);
			expect(p.focal).toMatch(/^\d+% \d+%$/);
			expect(p.alt.length).toBeGreaterThan(10);
		}
	});

	it('no file appears twice', () => {
		expect(new Set(PHOTOS.map((p) => p.src)).size).toBe(PHOTOS.length);
	});

	it('publishes only the consented', () => {
		const one = PHOTOS.map((p, i) => ({ ...p, consented: i === 0 }));
		expect(publishedPhotos(one)).toEqual([PHOTOS[0]].map((p) => ({ ...p, consented: true })));
		expect(publishedPhotos()).toEqual(PHOTOS.filter((p) => p.consented));
	});
});

describe('sponsors and stats', () => {
	it('every partner logo is in static/', () => {
		expect(SPONSORS.map((s) => s.name)).toEqual(['USTA', 'Babolat', 'Dunlop', 'UTR']);
		for (const s of SPONSORS) expect(exists(s.src), s.src).toBe(true);
	});

	it('the performance record carries its six numbers and the range they cover', () => {
		expect(SITE_STATS).toEqual({
			range: 'FALL 2022 – SPRING 2026',
			dualWins: '155',
			leagues: '12',
			top3: '29',
			winPct: 69.5,
			seasons: '39',
			ratio: '2.28:1'
		});
	});
});
