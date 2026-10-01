// The partners on the current momentum-tennis.com homepage. Babolat, Dunlop and USTA are the vector
// logos each serves on its own site (2026-09-30); UTR publishes its current mark only as a raster,
// so the academy's existing UTR image stays until UTR's brand kit supplies a vector.

export type Sponsor = { name: string; src: string; href?: string };

export const SPONSORS: Sponsor[] = [
	{ name: 'USTA', src: '/sponsors/usta.svg' },
	{ name: 'Babolat', src: '/sponsors/babolat.svg' },
	{ name: 'Dunlop', src: '/sponsors/dunlop.svg' },
	{ name: 'UTR', src: '/sponsors/utr.webp' }
];
