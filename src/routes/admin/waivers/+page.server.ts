import { fail } from '@sveltejs/kit';
import { message, setError, superValidate } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';
import { describeError } from '$lib/server/domain/result';
import { createDocument, documentSchema, listDocuments } from '$lib/server/domain/waivers';
import type { Actions, PageServerLoad } from './$types';

// hooks.server.ts has already refused anyone who is not an admin.

export const load: PageServerLoad = async ({ locals }) => {
	const docs = await listDocuments(locals.supabase);
	return {
		form: await superValidate(zod4(documentSchema)),
		documents: docs.ok ? docs.value : [],
		documentsError: docs.ok ? null : describeError(docs.error.code)
	};
};

export const actions: Actions = {
	default: async ({ request, locals }) => {
		const form = await superValidate(request, zod4(documentSchema));
		if (!form.valid) return fail(400, { form });
		const result = await createDocument(locals.supabase, form.data);
		if (!result.ok) {
			// a duplicate slug arrives as a unique violation
			const text =
				result.error.code === 'conflict'
					? 'A document with that short name already exists.'
					: describeError(result.error.code);
			return setError(form, 'slug', text, { status: 400 });
		}
		return message(form, `CREATED · ${form.data.slug.toUpperCase()}`);
	}
};
