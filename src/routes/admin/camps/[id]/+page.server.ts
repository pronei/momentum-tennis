import { error, fail } from '@sveltejs/kit';
import { message, setError, superValidate } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';
import { describeError } from '$lib/server/domain/result';
import {
	addCampDay,
	campDaySchema,
	campSchema,
	getCamp,
	listCampDays,
	updateCamp
} from '$lib/server/domain/schedule/camps';
import { listLocations } from '$lib/server/domain/schedule/locations';
import { getAcademyTimezone } from '$lib/server/domain/settings';
import { academyDate, academyTime } from '$lib/server/domain/time';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, locals }) => {
	const found = await getCamp(locals.supabase, params.id);
	if (!found.ok) error(500, describeError(found.error.code));
	if (!found.value) error(404, 'No such camp');
	const camp = found.value;

	const tz = await getAcademyTimezone(locals.supabase);
	const [days, venues] = await Promise.all([
		listCampDays(locals.supabase, camp.id),
		listLocations(locals.supabase)
	]);

	return {
		camp,
		days: (days.ok ? days.value : []).map((s) => ({
			id: s.id,
			date: academyDate(s.startsAt, tz),
			hours: `${academyTime(s.startsAt, tz)}–${academyTime(s.endsAt, tz)}`,
			court: s.courtName ?? '—',
			cancelled: s.cancelled
		})),
		loadError: days.ok ? null : describeError(days.error.code),
		courts: (venues.ok ? venues.value : [])
			.filter((v) => v.active)
			.flatMap((v) =>
				v.courts
					.filter((c) => c.active)
					.map((c) => ({ value: c.id, label: `${c.name} · ${v.name}` }))
			),
		campForm: await superValidate(
			{
				name: camp.name,
				startsOn: camp.startsOn,
				endsOn: camp.endsOn,
				capacity: camp.capacity,
				description: camp.description ?? ''
			},
			zod4(campSchema),
			{ id: 'camp' }
		),
		dayForm: await superValidate({ date: camp.startsOn }, zod4(campDaySchema), {
			id: 'day',
			errors: false
		})
	};
};

export const actions: Actions = {
	save: async ({ request, params, locals }) => {
		const form = await superValidate(request, zod4(campSchema), { id: 'camp' });
		if (!form.valid) return fail(400, { form });
		const result = await updateCamp(locals.supabase, params.id, form.data);
		if (!result.ok) return setError(form, '', describeError(result.error.code), { status: 400 });
		return message(form, 'SAVED');
	},

	day: async ({ request, params, locals }) => {
		const form = await superValidate(request, zod4(campDaySchema), { id: 'day' });
		if (!form.valid) return fail(400, { form });
		const tz = await getAcademyTimezone(locals.supabase);
		const result = await addCampDay(locals.supabase, params.id, form.data, tz);
		if (!result.ok) return setError(form, '', describeError(result.error.code), { status: 400 });
		return message(form, `ADDED · ${form.data.date} ${form.data.start}`);
	}
};
