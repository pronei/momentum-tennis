import { fail } from '@sveltejs/kit';
import { message, setError, superValidate } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';
import { describeError } from '$lib/server/domain/result';
import {
	courtSchema,
	createCourt,
	createLocation,
	listLocations,
	locationSchema,
	updateCourt
} from '$lib/server/domain/schedule/locations';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	const venues = await listLocations(locals.supabase);
	return {
		locations: venues.ok ? venues.value : [],
		loadError: venues.ok ? null : describeError(venues.error.code),
		locationForm: await superValidate(zod4(locationSchema), { id: 'location' }),
		courtForm: await superValidate(zod4(courtSchema), { id: 'court' })
	};
};

export const actions: Actions = {
	location: async ({ request, locals }) => {
		const form = await superValidate(request, zod4(locationSchema), { id: 'location' });
		if (!form.valid) return fail(400, { form });
		const result = await createLocation(locals.supabase, form.data);
		if (!result.ok)
			return setError(
				form,
				'name',
				result.error.code === 'conflict'
					? 'A location with that name already exists.'
					: describeError(result.error.code),
				{ status: 400 }
			);
		return message(form, `ADDED · ${form.data.name.toUpperCase()}`);
	},

	court: async ({ request, locals }) => {
		const form = await superValidate(request, zod4(courtSchema), { id: 'court' });
		if (!form.valid) return fail(400, { form });
		const result = await createCourt(locals.supabase, form.data);
		if (!result.ok)
			return setError(
				form,
				'name',
				result.error.code === 'conflict'
					? 'That court name is already used at this location.'
					: describeError(result.error.code),
				{ status: 400 }
			);
		return message(form, `ADDED · ${form.data.name.toUpperCase()}`);
	},

	// Courts are never deleted: sessions and audit rows point at them. Deactivating is what
	// takes one out of the pickers.
	toggleCourt: async ({ request, locals }) => {
		const data = await request.formData();
		const id = String(data.get('courtId') ?? '');
		const active = data.get('active') === 'true';
		if (!id) return fail(400, { courtError: describeError('validation') });
		const result = await updateCourt(locals.supabase, id, { active });
		if (!result.ok) return fail(400, { courtError: describeError(result.error.code) });
		return { toggled: id };
	}
};
