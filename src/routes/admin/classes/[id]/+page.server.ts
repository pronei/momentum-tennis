import { error, fail } from '@sveltejs/kit';
import { message, setError, superValidate } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';
import { listSkillLevels } from '$lib/server/domain/identity/players';
import { coachChoices, listStaff } from '$lib/server/domain/identity/staff';
import { describeError } from '$lib/server/domain/result';
import {
	classSchema,
	generateOccurrences,
	getClass,
	listTerms,
	setClassLevels,
	updateClass
} from '$lib/server/domain/schedule/classes';
import { listLocations } from '$lib/server/domain/schedule/locations';
import { getAcademyTimezone } from '$lib/server/domain/settings';
import { academyTime } from '$lib/server/domain/time';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, locals }) => {
	const found = await getClass(locals.supabase, params.id);
	if (!found.ok) error(500, describeError(found.error.code));
	if (!found.value) error(404, 'No such class');
	const template = found.value;

	const [terms, venues, staff, levels] = await Promise.all([
		listTerms(locals.supabase),
		listLocations(locals.supabase),
		listStaff(locals.supabase),
		listSkillLevels(locals.supabase)
	]);
	const term = (terms.ok ? terms.value : []).find((t) => t.id === template.termId) ?? null;

	return {
		template,
		term,
		levels: levels.ok ? levels.value : [],
		courts: (venues.ok ? venues.value : [])
			.filter((v) => v.active)
			.flatMap((v) =>
				v.courts
					.filter((c) => c.active)
					.map((c) => ({ value: c.id, label: `${c.name} · ${v.name}` }))
			),
		coaches: coachChoices(staff.ok ? staff.value : []).map((c) => ({
			value: c.id,
			label: c.label
		})),
		form: await superValidate(
			{
				termId: template.termId,
				name: template.name,
				weekday: template.weekday,
				startTimeLocal: template.startTimeLocal,
				durationMinutes: template.durationMinutes,
				capacity: template.capacity,
				defaultCourtId: template.defaultCourtId ?? '',
				defaultCoachId: template.defaultCoachId ?? ''
			},
			zod4(classSchema)
		)
	};
};

export const actions: Actions = {
	save: async ({ request, params, locals }) => {
		const form = await superValidate(request, zod4(classSchema));
		if (!form.valid) return fail(400, { form });
		const result = await updateClass(locals.supabase, params.id, form.data);
		if (!result.ok) return setError(form, '', describeError(result.error.code), { status: 400 });
		const tz = await getAcademyTimezone(locals.supabase);
		return message(form, `SAVED · ${academyTime(new Date(), tz)}`);
	},

	// Tags on the template are the defaults each generated occurrence inherits.
	levels: async ({ request, params, locals }) => {
		const keys = (await request.formData()).getAll('levels').map(String);
		const result = await setClassLevels(locals.supabase, params.id, keys);
		if (!result.ok) return fail(400, { levelsError: describeError(result.error.code) });
		return { tagged: result.value.tagged };
	},

	// Re-runnable: an occurrence whose court is not reserved is skipped and reported, never fatal.
	generate: async ({ request, params, locals }) => {
		const data = await request.formData();
		const from = String(data.get('from') ?? '');
		const to = String(data.get('to') ?? '');
		if (!from || !to) return fail(400, { generateError: describeError('validation') });
		const result = await generateOccurrences(locals.supabase, params.id, from, to);
		if (!result.ok) return fail(400, { generateError: describeError(result.error.code) });
		return { generated: result.value };
	}
};
