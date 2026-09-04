import { fail } from '@sveltejs/kit';
import { message, setError, superValidate } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';
import { CREDIT_LABELS, grantCredits, grantSchema } from '$lib/server/domain/booking/credits';
import { searchPlayers } from '$lib/server/domain/identity/players';
import { describeError } from '$lib/server/domain/result';
import { getAcademySettings } from '$lib/server/domain/settings';
import { academyDate } from '$lib/server/domain/time';
import type { Actions, PageServerLoad } from './$types';

type GrantRow = {
	id: string;
	player_id: string;
	credit_kind: keyof typeof CREDIT_LABELS;
	delta: number;
	reason: string | null;
	created_at: string;
	players: { full_name: string } | null;
};

export const load: PageServerLoad = async ({ url, locals }) => {
	const settings = await getAcademySettings(locals.supabase);
	const query = url.searchParams.get('q') ?? '';
	const [matches, recent] = await Promise.all([
		searchPlayers(locals.supabase, query),
		locals.supabase
			.from('credit_ledger')
			.select('id, player_id, credit_kind, delta, reason, created_at, players ( full_name )')
			.eq('entry_type', 'adjust')
			.order('created_at', { ascending: false })
			.limit(20)
	]);

	return {
		query,
		candidates: matches.ok ? matches.value : [],
		recent: ((recent.data ?? []) as unknown as GrantRow[]).map((r) => ({
			id: r.id,
			player: r.players?.full_name ?? '—',
			kind: CREDIT_LABELS[r.credit_kind],
			delta: r.delta,
			reason: r.reason ?? '—',
			on: academyDate(r.created_at, settings.timezone)
		})),
		loadError: matches.ok ? null : describeError(matches.error.code),
		// issued HERE, not in the action: a refresh or a double-click re-sends the same key and
		// issue_credits no-ops on conflict, so a slip of the mouse cannot grant twice
		form: await superValidate({ token: crypto.randomUUID() }, zod4(grantSchema), { errors: false })
	};
};

export const actions: Actions = {
	default: async ({ request, locals }) => {
		const form = await superValidate(request, zod4(grantSchema));
		if (!form.valid) return fail(400, { form });
		const result = await grantCredits(locals.supabase, form.data);
		if (!result.ok) return setError(form, '', describeError(result.error.code), { status: 400 });
		return message(
			form,
			result.value.lotId
				? `GRANTED · ${form.data.quantity} ${form.data.kind.toUpperCase()}`
				: 'ALREADY GRANTED — this form was submitted twice'
		);
	}
};
