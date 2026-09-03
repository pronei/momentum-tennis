import { fail, redirect } from '@sveltejs/kit';
import { setError, superValidate } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';
import { coachChoices, listStaff } from '$lib/server/domain/identity/staff';
import { describeError } from '$lib/server/domain/result';
import { listCamps } from '$lib/server/domain/schedule/camps';
import { listClasses } from '$lib/server/domain/schedule/classes';
import { listLocations } from '$lib/server/domain/schedule/locations';
import { createSession, SESSION_TYPES, sessionSchema } from '$lib/server/domain/schedule/sessions';
import { listTeams } from '$lib/server/domain/schedule/teams';
import { getAcademyTimezone } from '$lib/server/domain/settings';
import { academyDate } from '$lib/server/domain/time';
import type { Actions, PageServerLoad } from './$types';

const WEEKDAYS = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
const isType = (v: string): v is (typeof SESSION_TYPES)[number] =>
	(SESSION_TYPES as readonly string[]).includes(v);

export const load: PageServerLoad = async ({ url, locals }) => {
	const tz = await getAcademyTimezone(locals.supabase);
	const [venues, staff, classes, camps, teams] = await Promise.all([
		listLocations(locals.supabase),
		listStaff(locals.supabase),
		listClasses(locals.supabase),
		listCamps(locals.supabase),
		listTeams(locals.supabase)
	]);

	// `?type=` is what makes this work without JavaScript: the SegmentedControl switches the
	// type in the browser, and the four links reload the page with it set on the server.
	const asked = url.searchParams.get('type') ?? '';
	const type = isType(asked) ? asked : 'class';

	return {
		type,
		locationId: url.searchParams.get('location') ?? '',
		form: await superValidate(
			{
				type,
				courtId: url.searchParams.get('court') ?? '',
				date: url.searchParams.get('date') ?? academyDate(new Date(), tz),
				start: url.searchParams.get('start') ?? ''
			},
			zod4(sessionSchema)
		),
		courts: (venues.ok ? venues.value : [])
			.filter((v) => v.active)
			.flatMap((v) =>
				v.courts.filter((c) => c.active).map((c) => ({ id: c.id, label: `${c.name} · ${v.name}` }))
			),
		coaches: coachChoices(staff.ok ? staff.value : []),
		parents: {
			class: (classes.ok ? classes.value : []).map((c) => ({
				value: c.id,
				label: `${WEEKDAYS[c.weekday - 1]} ${c.startTimeLocal} · ${c.name}`
			})),
			camp: (camps.ok ? camps.value : []).map((c) => ({
				value: c.id,
				label: `${c.startsOn} · ${c.name}`
			})),
			team: (teams.ok ? teams.value : []).map((t) => ({
				value: t.id,
				label: `${t.season} · ${t.name}`
			})),
			private: []
		}
	};
};

export const actions: Actions = {
	default: async ({ request, url, locals }) => {
		const form = await superValidate(request, zod4(sessionSchema));
		if (!form.valid) return fail(400, { form });

		const tz = await getAcademyTimezone(locals.supabase);
		const created = await createSession(locals.supabase, form.data, tz);
		// slot_taken and court_unavailable are the database refusing; the form shows the refusal
		if (!created.ok) return setError(form, '', describeError(created.error.code), { status: 400 });

		const location = url.searchParams.get('location') ?? '';
		redirect(303, `/admin/schedule?location=${location}&date=${form.data.date}`);
	}
};
