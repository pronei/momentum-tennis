// The seasonal camp banner (PRODUCT.md §12), reading phase-3 `camps` rows in place of the kit's
// SEASON_EVENTS. Camp rows are weeks; a summer is every row of one year, so the banner speaks of
// the season's span. Dates are academy-local 'YYYY-MM-DD' strings: they compare as they sort.

export type CampDates = { startsOn: string; endsOn: string };
export type CampWindow = {
	label: string;
	blurb: string;
	/** ENROLLING NOW · RETURNS <year> · DATES COMING */
	status: string;
	/** the season's span in mono */
	window: string;
	/** what the nav says beside Summer camps */
	note: string;
};

const LABEL = 'Summer camps at De Anza';
const BLURB = 'Tennis mornings, studio afternoons — chess, music production, photography, art.';
const MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
const stamp = (iso: string) => {
	const [, m, d] = iso.split('-');
	return `${MONTHS[Number(m) - 1]} ${Number(d)}`;
};

export function campWindow(camps: CampDates[], today: string): CampWindow {
	const byYear = new Map<string, { start: string; end: string }>();
	for (const c of camps) {
		const year = c.startsOn.slice(0, 4);
		const s = byYear.get(year);
		byYear.set(year, {
			start: s && s.start < c.startsOn ? s.start : c.startsOn,
			end: s && s.end > c.endsOn ? s.end : c.endsOn
		});
	}
	const seasons = [...byYear.entries()]
		.map(([year, s]) => ({ year, ...s }))
		.sort((a, b) => (a.start < b.start ? -1 : 1));

	const live = seasons.find((s) => s.start <= today && today <= s.end);
	if (live)
		return {
			label: LABEL,
			blurb: BLURB,
			status: 'ENROLLING NOW',
			window: `${stamp(live.start)} – ${stamp(live.end)}`,
			note: 'ENROLLING NOW'
		};
	const next = seasons.find((s) => s.start > today);
	if (next) {
		const window = `${stamp(next.start)} – ${stamp(next.end)}, ${next.year}`;
		return { label: LABEL, blurb: BLURB, status: `RETURNS ${next.year}`, window, note: window };
	}
	return {
		label: LABEL,
		blurb: BLURB,
		status: 'DATES COMING',
		window: 'ANNOUNCED EACH SPRING',
		note: 'ANNOUNCED EACH SPRING'
	};
}
