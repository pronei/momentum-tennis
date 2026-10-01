// The photo archive: the founder's curated archive (design-system/assets/photos) and the academy's
// own photographs from momentum-tennis.com, with duplicates of the archive removed. Every file is
// re-encoded as WebP at 1600px on the long edge with no metadata — eight of the sources carried GPS
// coordinates. Content stands in for the admin console PRODUCT.md §12 describes.
//
// Consent: signed media releases exist for the minors pictured (the user, 2026-09-30). `consented`
// stays on every entry so that withdrawing one is a one-word change; pages read publishedPhotos().
// Order is curation: the first six are the home page row.

export type Ratio = '3:2' | '4:3' | '1:1' | '16:9' | '3:4' | '2:3';
export type Photo = {
	/** under static/ */
	src: string;
	/** pixel size of the file — the lightbox needs it before the image loads */
	width: number;
	height: number;
	/** the crop a grid shows; the file's own shape */
	ratio: Ratio;
	/** CSS object-position: where the faces are */
	focal: string;
	alt: string;
	consented: boolean;
};

export const PHOTOS: Photo[] = [
	{
		src: '/photos/medals-celebration-l.webp',
		width: 1600,
		height: 1023,
		ratio: '3:2',
		focal: '50% 40%',
		alt: 'A team celebrating with medals under a Junior Team Tennis Championship banner',
		consented: true
	},
	{
		src: '/photos/indoor-jump-l.webp',
		width: 1564,
		height: 878,
		ratio: '16:9',
		focal: '50% 45%',
		alt: 'A team jumping with arms raised on an indoor court',
		consented: true
	},
	{
		src: '/photos/deanza-trophies-l.webp',
		width: 1600,
		height: 1200,
		ratio: '4:3',
		focal: '50% 50%',
		alt: 'Four juniors at the net holding their trophies',
		consented: true
	},
	{
		src: '/photos/night-court-p.webp',
		width: 1200,
		height: 1600,
		ratio: '3:4',
		focal: '50% 35%',
		alt: 'A junior with a racquet and a medal on court at dusk',
		consented: true
	},
	{
		src: '/photos/jtt-banner-team-l.webp',
		width: 1600,
		height: 1200,
		ratio: '4:3',
		focal: '50% 45%',
		alt: 'Coaches and a junior team under a Junior Team Tennis Championship banner',
		consented: true
	},
	{
		src: '/photos/coach-four-medals-l.webp',
		width: 1600,
		height: 1200,
		ratio: '4:3',
		focal: '50% 40%',
		alt: 'A coach with four juniors wearing medals',
		consented: true
	},
	{
		src: '/photos/net-rally-l.webp',
		width: 1600,
		height: 1200,
		ratio: '4:3',
		focal: '50% 45%',
		alt: 'A junior team lined up at the net with racquets',
		consented: true
	},
	{
		src: '/photos/racquets-up-l.webp',
		width: 1600,
		height: 1200,
		ratio: '4:3',
		focal: '50% 42%',
		alt: 'Juniors raising their racquets on court',
		consented: true
	},
	{
		src: '/photos/champs-banner-l.webp',
		width: 1600,
		height: 1200,
		ratio: '4:3',
		focal: '50% 55%',
		alt: 'Momentum teams and coaches under a Junior Team Tennis Championship banner',
		consented: true
	},
	{
		src: '/photos/court-walk-l.webp',
		width: 1600,
		height: 1200,
		ratio: '4:3',
		focal: '50% 50%',
		alt: 'Four players with medals and racquet bags on court',
		consented: true
	},
	{
		src: '/photos/team-court-wide-l.webp',
		width: 1600,
		height: 1200,
		ratio: '4:3',
		focal: '50% 45%',
		alt: 'A coach and a junior team on court',
		consented: true
	},
	{
		src: '/photos/coaches-team-l.webp',
		width: 1600,
		height: 1200,
		ratio: '4:3',
		focal: '50% 40%',
		alt: 'Coaches and older players lined up at the net',
		consented: true
	},
	{
		src: '/photos/team-lineup-l.webp',
		width: 1600,
		height: 1196,
		ratio: '4:3',
		focal: '50% 45%',
		alt: 'Coaches and a junior team lined up on a hard court',
		consented: true
	},
	{
		src: '/photos/team-medals-l.webp',
		width: 1600,
		height: 1381,
		ratio: '4:3',
		focal: '50% 35%',
		alt: 'Four teenage players wearing medals',
		consented: true
	},
	{
		src: '/photos/team-sky-p.webp',
		width: 1200,
		height: 1600,
		ratio: '3:4',
		focal: '50% 60%',
		alt: 'A junior team lined up on court under a cloudy sky',
		consented: true
	},
	{
		src: '/photos/ball-trophy-p.webp',
		width: 1200,
		height: 1600,
		ratio: '3:4',
		focal: '50% 30%',
		alt: 'A junior holding up a ball trophy on court',
		consented: true
	},
	{
		src: '/photos/medal-shirt-p.webp',
		width: 1200,
		height: 1600,
		ratio: '3:4',
		focal: '50% 35%',
		alt: 'A junior in a Momentum Tennis shirt holding up a medal',
		consented: true
	},
	{
		src: '/photos/ball-trophy-banner-l.webp',
		width: 1600,
		height: 1200,
		ratio: '4:3',
		focal: '50% 45%',
		alt: 'Coaches and juniors with a ball trophy under a championship banner',
		consented: true
	},
	{
		src: '/photos/banner-trees-l.webp',
		width: 1600,
		height: 1200,
		ratio: '4:3',
		focal: '50% 45%',
		alt: 'Coaches and a team with medals under a championship banner among trees',
		consented: true
	},
	{
		src: '/photos/medals-lineup-l.webp',
		width: 1600,
		height: 1172,
		ratio: '4:3',
		focal: '50% 40%',
		alt: 'A coach and a junior team with medals lined up on a hard court',
		consented: true
	},
	{
		src: '/photos/shade-four-juniors-l.webp',
		width: 1600,
		height: 1200,
		ratio: '4:3',
		focal: '50% 40%',
		alt: 'Four juniors with racquets and water bottles in the shade of trees',
		consented: true
	},
	{
		src: '/photos/clubhouse-path-p.webp',
		width: 1200,
		height: 1600,
		ratio: '3:4',
		focal: '50% 55%',
		alt: 'Juniors with racquets on the path beside a clubhouse',
		consented: true
	},
	{
		src: '/photos/net-fists-l.webp',
		width: 1600,
		height: 1200,
		ratio: '4:3',
		focal: '50% 40%',
		alt: 'Juniors and a coach lined up at the net, fists raised',
		consented: true
	},
	{
		src: '/photos/net-coach-l.webp',
		width: 1600,
		height: 1200,
		ratio: '4:3',
		focal: '50% 40%',
		alt: 'Juniors and a coach together at the net',
		consented: true
	},
	{
		src: '/photos/hood-medal-p.webp',
		width: 1200,
		height: 1600,
		ratio: '3:4',
		focal: '50% 35%',
		alt: 'A junior in a hooded top holding up a medal',
		consented: true
	},
	{
		src: '/photos/blue-medal-p.webp',
		width: 1200,
		height: 1600,
		ratio: '3:4',
		focal: '50% 35%',
		alt: 'A junior in a blue shirt holding up a medal',
		consented: true
	},
	{
		src: '/photos/two-juniors-p.webp',
		width: 1200,
		height: 1600,
		ratio: '3:4',
		focal: '50% 40%',
		alt: 'Two juniors with racquets on court',
		consented: true
	},
	{
		src: '/photos/coach-four-p.webp',
		width: 1200,
		height: 1600,
		ratio: '3:4',
		focal: '50% 40%',
		alt: 'A coach standing behind four juniors on court',
		consented: true
	},
	{
		src: '/photos/evening-net-l.webp',
		width: 1600,
		height: 1200,
		ratio: '4:3',
		focal: '50% 45%',
		alt: 'A coach and a junior team at the net in evening light',
		consented: true
	},
	{
		src: '/photos/coach-net-l.webp',
		width: 1600,
		height: 1200,
		ratio: '4:3',
		focal: '50% 45%',
		alt: 'A coach with juniors lined up at the net',
		consented: true
	},
	{
		src: '/photos/group-outdoors-l.webp',
		width: 1600,
		height: 1200,
		ratio: '4:3',
		focal: '50% 40%',
		alt: 'Juniors and coaches gathered together outdoors',
		consented: true
	}
];

/** The photos a page may show: consented only, in curated order. */
export const publishedPhotos = (all: Photo[] = PHOTOS): Photo[] => all.filter((p) => p.consented);
