import { fail } from '@sveltejs/kit';
import { message, setError, superValidate } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';
import { coachChoices, listStaff } from '$lib/server/domain/identity/staff';
import { describeError } from '$lib/server/domain/result';
import {
	classSchema,
	createClass,
	createTerm,
	listClasses,
	listTerms,
	termSchema
} from '$lib/server/domain/schedule/classes';
import { listLocations } from '$lib/server/domain/schedule/locations';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url, locals }) => {
	const [terms, venues, staff] = await Promise.all([
		listTerms(locals.supabase),
		listLocations(locals.supabase),
		listStaff(locals.supabase)
	]);
	const list = terms.ok ? terms.value : [];
	const asked = url.searchParams.get('term') ?? '';
	const termId = list.some((t) => t.id === asked) ? asked : (list.at(-1)?.id ?? '');
	const classes = termId ? await listClasses(locals.supabase, termId) : null;

	return {
		terms: list,
		termId,
		classes: classes?.ok ? classes.value : [],
		loadError: !terms.ok
			? describeError(terms.error.code)
			: classes && !classes.ok
				? describeError(classes.error.code)
				: null,
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
		termForm: await superValidate(zod4(termSchema), { id: 'term' }),
		classForm: await superValidate({ termId }, zod4(classSchema), { id: 'class', errors: false })
	};
};

export const actions: Actions = {
	term: async ({ request, locals }) => {
		const form = await superValidate(request, zod4(termSchema), { id: 'term' });
		if (!form.valid) return fail(400, { form });
		const result = await createTerm(locals.supabase, form.data);
		if (!result.ok)
			return setError(
				form,
				'name',
				result.error.code === 'conflict'
					? 'A term with that name already exists.'
					: describeError(result.error.code),
				{ status: 400 }
			);
		return message(form, `ADDED · ${form.data.name.toUpperCase()}`);
	},

	class: async ({ request, locals }) => {
		const form = await superValidate(request, zod4(classSchema), { id: 'class' });
		if (!form.valid) return fail(400, { form });
		const result = await createClass(locals.supabase, form.data);
		if (!result.ok) return setError(form, '', describeError(result.error.code), { status: 400 });
		return message(form, `ADDED · ${form.data.name.toUpperCase()}`);
	}
};
