import { error, fail } from '@sveltejs/kit';
import { message, setError, superValidate } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';
import { describeError } from '$lib/server/domain/result';
import {
	addException,
	addWindow,
	deleteException,
	endWindow,
	exceptionSchema,
	listExceptions,
	listWindows,
	windowSchema
} from '$lib/server/domain/schedule/availability';
import { listLocations } from '$lib/server/domain/schedule/locations';
import { getAcademyTimezone } from '$lib/server/domain/settings';
import { academyDate } from '$lib/server/domain/time';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, locals }) => {
	const venues = await listLocations(locals.supabase);
	if (!venues.ok) error(500, describeError(venues.error.code));
	const location = venues.value.find((v) => v.courts.some((c) => c.id === params.courtId));
	const court = location?.courts.find((c) => c.id === params.courtId);
	if (!court || !location) error(404, 'No such court');

	const tz = await getAcademyTimezone(locals.supabase);
	const [windows, exceptions] = await Promise.all([
		listWindows(locals.supabase, court.id),
		listExceptions(locals.supabase, court.id)
	]);

	return {
		court,
		location: { id: location.id, name: location.name },
		windows: windows.ok ? windows.value : [],
		exceptions: exceptions.ok ? exceptions.value : [],
		loadError: !windows.ok
			? describeError(windows.error.code)
			: !exceptions.ok
				? describeError(exceptions.error.code)
				: null,
		today: academyDate(new Date(), tz),
		windowForm: await superValidate(
			{ courtId: court.id, effectiveFrom: academyDate(new Date(), tz) },
			zod4(windowSchema),
			{ id: 'window', errors: false }
		),
		exceptionForm: await superValidate({ courtId: court.id }, zod4(exceptionSchema), {
			id: 'exception',
			errors: false
		})
	};
};

export const actions: Actions = {
	window: async ({ request, locals }) => {
		const form = await superValidate(request, zod4(windowSchema), { id: 'window' });
		if (!form.valid) return fail(400, { form });
		const result = await addWindow(locals.supabase, form.data);
		if (!result.ok) return setError(form, '', describeError(result.error.code), { status: 400 });
		return message(form, `RESERVED · ${form.data.openLocal}–${form.data.closeLocal}`);
	},

	// Ending a window is refused outright while a scheduled session still sits inside it.
	end: async ({ request, locals }) => {
		const data = await request.formData();
		const id = String(data.get('windowId') ?? '');
		const on = String(data.get('on') ?? '');
		if (!id || !on) return fail(400, { windowError: describeError('validation') });
		const result = await endWindow(locals.supabase, id, on);
		if (!result.ok) return fail(400, { windowError: describeError(result.error.code) });
		return { ended: id };
	},

	exception: async ({ request, locals }) => {
		const form = await superValidate(request, zod4(exceptionSchema), { id: 'exception' });
		if (!form.valid) return fail(400, { form });
		const result = await addException(locals.supabase, form.data);
		if (!result.ok) return setError(form, '', describeError(result.error.code), { status: 400 });
		return message(form, `${form.data.kind.toUpperCase()} · ${form.data.onDate}`);
	},

	dropException: async ({ request, locals }) => {
		const id = String((await request.formData()).get('exceptionId') ?? '');
		if (!id) return fail(400, { exceptionError: describeError('validation') });
		const result = await deleteException(locals.supabase, id);
		if (!result.ok) return fail(400, { exceptionError: describeError(result.error.code) });
		return { dropped: id };
	}
};
