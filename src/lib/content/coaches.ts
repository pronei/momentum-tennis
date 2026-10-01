// The coaching staff, from momentum-tennis.com/our-staff (2026-09-30), edited for grammar and flow
// — no new claims. Content stands in for the admin console PRODUCT.md §12 describes.
//
// Consent: signed media releases exist for the minors (the user, 2026-09-30). `consented` stays on
// every entry so that withdrawing one is a one-word change, and pages read only publishedCoaches().

export type Coach = {
	slug: string;
	name: string;
	role: string;
	/** paragraphs */
	bio: string[];
	/** under static/, or null for a text-only profile */
	photo: string | null;
	consented: boolean;
};

export const COACHES: Coach[] = [
	{
		slug: 'artur-westergren',
		name: 'Artur Westergren',
		role: 'Founder & director',
		photo: '/coaches/artur-westergren.webp',
		consented: true,
		bio: [
			'Coach Artur Westergren is the founder and director of Momentum Tennis, a Northern California junior program built on the belief that exceptional player development begins with strong fundamentals, a positive learning environment and a passion for competition. In more than 17 years of coaching he has helped hundreds of junior players grow in skill, confidence and love of the game, while guiding teams and athletes to consistent competitive success.',
			"As a junior, Artur competed at the highest level of Northern California tennis in the Boys' 18s. That background gives him firsthand insight into the dedication, discipline and mindset junior tennis demands, on court and beyond.",
			'He is a USTA High Performance Certified Coach, bringing advanced training methods and proven player-development systems to every lesson, clinic and team practice. His coaching emphasizes technical excellence, tactical awareness, athletic development, sportsmanship and confidence, on and off the court.',
			"Under his leadership Momentum Tennis has become one of Northern California's most successful junior programs. Between fall 2022 and spring 2026 it fielded 39 USTA Junior Team Tennis squads, compiled a 155–68 dual-match record, won 12 league championships and earned 29 top-three league finishes across the 10U, 12U, 14U and 18U divisions — a winning culture built on long-term player development.",
			'Whether he is coaching a beginner’s first swing or a tournament player pursuing college tennis, Coach Artur is dedicated to helping every player reach their full potential: developing not only stronger players, but confident, resilient young people who carry the lessons of the court into every part of life.'
		]
	},
	{
		slug: 'vishal',
		name: 'Vishal',
		role: 'Lead instructor',
		photo: '/coaches/vishal.webp',
		consented: true,
		bio: [
			"Coach Vishal is an enthusiastic, experienced coach with a rich background in playing and teaching the game. He started at six in Cupertino and quickly became a competitive player, winning the 2002 Seascape Monterey Bay Junior Challenger Boys' 16s singles title. In high school he was a two-time varsity MVP and played No. 1 singles from his sophomore year.",
			'He spent his summers running tennis programs at local centers. After a decade-long career in tech and music, he returned to tennis after the pandemic, including as lead instructor at Lifetime Tennis, developing players of all ages and levels.',
			"At Momentum Tennis he oversees the junior and adult programs, and he also coaches the boys' and girls' varsity teams at his former high school, Pinewood. He still competes at a high level in USTA and UTR tournaments.",
			'Off court he enjoys soccer (Milan) and basketball (the Warriors), travel, live music and time with friends and family. He looks forward to meeting new players, beginners and experienced alike, on court.'
		]
	},
	{
		slug: 'tom-anderson',
		name: 'Tom Anderson',
		role: 'Junior tennis expert',
		photo: '/coaches/tom-anderson.webp',
		consented: true,
		// The source switches between "they" and "he"; this version needs neither.
		bio: [
			'Coach Tom brings more than a decade of experience as a tennis pro and is dedicated to developing players of all ages and skill levels. Tom started on court young, became a competitive junior with titles and accolades in junior tournaments, then moved into coaching, leading numerous programs with a focus on technique, strategy and a love of the game.',
			'Committed to skill and sportsmanship alike, Tom has coached at clubs and schools, including leading varsity teams to success, and still competes in local leagues and tournaments.',
			'Away from coaching, Tom enjoys the outdoors, travel and time with friends and family, and is excited to share a knowledge of and enthusiasm for tennis that helps players reach their goals and keep a lifelong love of the sport.'
		]
	},
	{
		slug: 'surya',
		name: 'Surya',
		role: 'Coach',
		photo: '/coaches/surya.webp',
		consented: true,
		bio: [
			'Coach Surya has played tennis for more than a decade. He joined his middle school team and played until the COVID-19 pandemic, then played three years in high school, where his leadership and dedication made him team captain.',
			'He has coached around 200 hours at Momentum Tennis, and biked to every session — a measure of his commitment to the sport and to the players he mentors.'
		]
	},
	{
		slug: 'zach',
		name: 'Zach',
		role: 'Coach',
		photo: '/coaches/zach.webp',
		consented: true,
		bio: [
			"Coach Zach's passion for tennis started early, playing with his father. He joined his school's junior high team and made varsity as a high school freshman, and he keeps improving through clinics, private lessons, year-round JTT and other tournaments. He was one of only six players chosen to represent his school at the CCS semifinals.",
			'He has coached at Momentum Tennis summer camps, teaching players of all ages.'
		]
	},
	{
		slug: 'matthew',
		name: 'Matthew',
		role: 'College coach',
		photo: '/coaches/matthew.webp',
		consented: true,
		bio: [
			'Matthew plays on the varsity team at Los Altos High School. He picked up a racket at nine and was competing in tournaments by eleven; across more than 250 USTA matches he has been a regional semifinalist once, a sectional champion twice and a local champion eight times.',
			'He trains locally and abroad, including an intensive program at the JC Ferrero Equelite Academy in Spain in the summer of 2023.',
			'Matthew has three years of coaching experience with players of all ages and levels — in summer camps, private lessons and a special-needs program — adapting his coaching to different ways of learning. He emphasizes technical precision, strategic awareness and strong footwork, and coaches out of a genuine wish to inspire the next generation of players.'
		]
	}
];

/** The coaches a page may show: consented only, in the order above (Artur first). */
export const publishedCoaches = (all: Coach[] = COACHES): Coach[] => all.filter((c) => c.consented);
