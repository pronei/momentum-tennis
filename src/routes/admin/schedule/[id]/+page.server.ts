import { error, fail, redirect } from '@sveltejs/kit';
import { message, setError, superValidate } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';
import { coachChoices, listStaff } from '$lib/server/domain/identity/staff';
import { listSkillLevels } from '$lib/server/domain/identity/players';
import { describeError } from '$lib/server/domain/result';
import { listLocations } from '$lib/server/domain/schedule/locations';
import {
	cancelSession,
	getSession,
	sessionSchema,
	setSessionLevels,
	updateSession
} from '$lib/server/domain/schedule/sessions';
import { getAcademyTimezone } from '$lib/server/domain/settings';
import { academyDate, academyTime } from '$lib/server/domain/time';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, url, locals }) => {
	const tz = await getAcademyTimezone(locals.supabase);
	const found = await getSession(locals.supabase, params.id);
	if (!found.ok) error(500, describeError(found.error.code));
	if (!found.value) error(404, 'No such session');
	const session = found.value;

	const [venues, staff, levels] = await Promise.all([
		listLocations(locals.supabase),
		listStaff(locals.supabase),
		listSkillLevels(locals.supabase)
	]);

	return {
		session,
		locationId: url.searchParams.get('location') ?? session.locationId ?? '',
		localDate: academyDate(session.startsAt, tz),
		form: await superValidate(
			{
				type: session.type,
				parentId: session.parentId ?? '',
				courtId: session.courtId ?? '',
				coachId: session.coachId ?? '',
				date: academyDate(session.startsAt, tz),
				start: academyTime(session.startsAt, tz),
				end: academyTime(session.endsAt, tz),
				notes: session.notes ?? '',
				venueNote: session.venueNote ?? ''
			},
			zod4(sessionSchema)
		),
		courts: (venues.ok ? venues.value : [])
			.filter((v) => v.active)
			.flatMap((v) =>
				v.courts.filter((c) => c.active).map((c) => ({ id: c.id, label: `${c.name} · ${v.name}` }))
			),
		coaches: coachChoices(staff.ok ? staff.value : []),
		levels: levels.ok ? levels.value : []
	};
};

export const actions: Actions = {
	save: async ({ request, params, locals }) => {
		const form = await superValidate(request, zod4(sessionSchema));
		if (!form.valid) return fail(400, { form });
		const tz = await getAcademyTimezone(locals.supabase);
		const saved = await updateSession(locals.supabase, params.id, form.data, tz);
		if (!saved.ok) return setError(form, '', describeError(saved.error.code), { status: 400 });
		return message(form, `SAVED · ${academyTime(new Date(), tz)}`);
	},

	// Replacing the whole tag set is one call: no rows means every level, so a partial
	// rewrite would briefly open the slot to everyone.
	levels: async ({ request, params, locals }) => {
		const keys = (await request.formData()).getAll('levels').map(String);
		const result = await setSessionLevels(locals.supabase, params.id, keys);
		if (!result.ok) return fail(400, { levelsError: describeError(result.error.code) });
		return { tagged: result.value.tagged };
	},

	cancel: async ({ request, params, locals }) => {
		const data = await request.formData();
		const result = await cancelSession(
			locals.supabase,
			params.id,
			String(data.get('reason') ?? '')
		);
		if (!result.ok) return fail(400, { cancelError: describeError(result.error.code) });
		const back = String(data.get('back') ?? '/admin/schedule');
		redirect(303, `${back}&cancelled=${result.value.madeWhole}`);
	}
};
