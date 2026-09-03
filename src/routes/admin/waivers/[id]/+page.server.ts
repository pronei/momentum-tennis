import { error, fail } from '@sveltejs/kit';
import { message, setError, superValidate } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';
import { describeError } from '$lib/server/domain/result';
import {
	createDraft,
	draftSchema,
	listDocuments,
	listVersions,
	publishVersion,
	signerCountForDocument,
	updateDraft
} from '$lib/server/domain/waivers';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, locals }) => {
	const [docs, versions, signers] = await Promise.all([
		listDocuments(locals.supabase),
		listVersions(locals.supabase, params.id),
		signerCountForDocument(locals.supabase, params.id)
	]);
	if (!docs.ok) error(500, describeError(docs.error.code));
	const document = docs.value.find((d) => d.id === params.id);
	if (!document) error(404, 'No such document');
	if (!versions.ok) error(500, describeError(versions.error.code));

	const draft = versions.value.find((v) => v.publishedAt === null) ?? null;
	return {
		document,
		versions: versions.value,
		draft,
		// how many players a publish would send back through signing
		signerCount: signers.ok ? signers.value : 0,
		form: await superValidate({ contentMd: draft?.contentMd ?? '' }, zod4(draftSchema))
	};
};

export const actions: Actions = {
	// One action for both: a document has at most one open draft, so saving either
	// creates it or edits the existing one.
	draft: async ({ request, params, locals }) => {
		const form = await superValidate(request, zod4(draftSchema));
		if (!form.valid) return fail(400, { form });

		const versions = await listVersions(locals.supabase, params.id);
		if (!versions.ok)
			return setError(form, '', describeError(versions.error.code), { status: 400 });
		const existing = versions.value.find((v) => v.publishedAt === null);

		const result = existing
			? await updateDraft(locals.supabase, existing.id, form.data.contentMd)
			: await createDraft(locals.supabase, params.id, form.data.contentMd);
		if (!result.ok) return setError(form, '', describeError(result.error.code), { status: 400 });
		return message(form, existing ? 'DRAFT SAVED' : 'DRAFT CREATED');
	},

	publish: async ({ request, params, locals }) => {
		const versionId = String((await request.formData()).get('versionId') ?? '');
		if (!versionId) return fail(400, { publishError: describeError('validation') });
		const result = await publishVersion(locals.supabase, versionId);
		if (!result.ok) return fail(400, { publishError: describeError(result.error.code) });
		// Deliberately no redirect: the admin should see the new version in force.
		return { published: params.id };
	}
};
