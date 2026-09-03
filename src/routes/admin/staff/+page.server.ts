import { fail } from '@sveltejs/kit';
import { message, setError, superValidate } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';
import { z } from 'zod';
import {
	findAccountByEmail,
	grantRole,
	listStaff,
	revokeRole
} from '$lib/server/domain/identity/staff';
import { describeError } from '$lib/server/domain/result';
import type { Actions, PageServerLoad } from './$types';

// hooks.server.ts has already refused anyone who is not an admin.

const grantSchema = z.object({
	email: z.email('Enter the email they signed up with'),
	role: z.enum(['coach', 'admin']).default('coach')
});
const revokeSchema = z.object({
	accountId: z.uuid(),
	role: z.enum(['coach', 'admin'])
});

export const load: PageServerLoad = async ({ locals }) => {
	const staff = await listStaff(locals.supabase);
	return {
		form: await superValidate(zod4(grantSchema)),
		staff: staff.ok ? staff.value : [],
		staffError: staff.ok ? null : describeError(staff.error.code)
	};
};

export const actions: Actions = {
	grant: async ({ request, locals }) => {
		const form = await superValidate(request, zod4(grantSchema));
		if (!form.valid) return fail(400, { form });

		// A role attaches to an account that exists — we never create one for someone.
		const found = await findAccountByEmail(locals.supabase, form.data.email);
		if (!found.ok) return setError(form, '', describeError(found.error.code), { status: 400 });
		if (!found.value)
			return setError(form, 'email', 'No account has signed up with that email yet.', {
				status: 400
			});

		const granted = await grantRole(locals.supabase, found.value.id, form.data.role);
		if (!granted.ok) return setError(form, '', describeError(granted.error.code), { status: 400 });
		return message(form, `GRANTED · ${form.data.role.toUpperCase()} · ${found.value.email}`);
	},

	revoke: async ({ request, locals }) => {
		const parsed = revokeSchema.safeParse(Object.fromEntries(await request.formData()));
		if (!parsed.success) return fail(400, { revokeError: describeError('validation') });
		const result = await revokeRole(locals.supabase, parsed.data.accountId, parsed.data.role);
		if (!result.ok) return fail(400, { revokeError: describeError(result.error.code) });
		return { revoked: `${parsed.data.role.toUpperCase()} REVOKED` };
	}
};
