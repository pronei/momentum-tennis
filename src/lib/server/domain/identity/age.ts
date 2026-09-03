import { academyDate } from '../time';

// Display-side age facts. The database decides what age MEANS (player_is_adult() gates
// self-signing); these mirror its rule so the portal never shows a different answer.

/** The academy-local calendar date, split. */
function localParts(tz: string, at: string | Date): [number, number, number] {
	const [y, m, d] = academyDate(at, tz).split('-').map(Number);
	return [y, m, d];
}

/** Adult iff birthdate <= (academy-local today − 18 years) — the SQL rule, verbatim. */
export function isAdultOn(birthdate: string, tz: string, at: string | Date = new Date()): boolean {
	const [y, m, d] = localParts(tz, at);
	const cutoff = `${String(y - 18).padStart(4, '0')}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
	return birthdate <= cutoff;
}

/** Whole years old today, in academy-local time. */
export function ageOn(birthdate: string, tz: string, at: string | Date = new Date()): number {
	const [y, m, d] = localParts(tz, at);
	const [by, bm, bd] = birthdate.split('-').map(Number);
	let age = y - by;
	if (m < bm || (m === bm && d < bd)) age -= 1;
	return age;
}
