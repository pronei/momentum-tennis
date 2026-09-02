import type { LayoutServerLoad } from './$types';

/** The portal shell's facts. hooks.server.ts has already guaranteed a user. */
export const load: LayoutServerLoad = async ({ locals }) => {
	const { data: account } = await locals.supabase
		.from('accounts')
		.select('full_name, email, phone')
		.eq('id', locals.user!.id)
		.maybeSingle();
	return { account: account ?? { full_name: '', email: locals.user!.email ?? '', phone: null } };
};
