import { campWindow } from '$lib/content/camps';
import { listCamps } from '$lib/server/domain/schedule/camps';
import { academyDate } from '$lib/server/domain/time';
import type { LayoutServerLoad } from './$types';

// The public shell's facts: who is looking (Log in ↔ Account, where Book goes) and the camp season,
// read from the phase-3 camp rows anyone may read (read_camps), judged in academy time.
export const load: LayoutServerLoad = async ({ locals, parent }) => {
	const { tz } = await parent();
	const camps = await listCamps(locals.supabase);
	const today = academyDate(new Date(), tz);
	return {
		loggedIn: Boolean(locals.user),
		camp: campWindow(camps.ok ? camps.value : [], today),
		year: today.slice(0, 4)
	};
};
