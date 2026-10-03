import { fail, redirect } from '@sveltejs/kit';
import { setError, superValidate } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';
import { describeError } from '$lib/server/domain/result';
import { createScorecard, teamMatches } from '$lib/server/domain/scorecards/cards';
import { headerSchema, type HeaderInput } from '$lib/server/domain/scorecards/form';
import { listTeams } from '$lib/server/domain/schedule/teams';
import { getAcademySettings } from '$lib/server/domain/settings';
import { academyDate } from '$lib/server/domain/time';
import type { Actions, PageServerLoad } from './$types';

// Two GET steps, no JavaScript: the team, then the scheduled match (or none) and the header.

export const load: PageServerLoad = async ({ url, locals }) => {
	const [settings, teams] = await Promise.all([
		getAcademySettings(locals.supabase),
		listTeams(locals.supabase)
	]);
	const tz = settings.timezone;
	const all = teams.ok ? teams.value : [];
	const team = all.find((t) => t.id === url.searchParams.get('team')) ?? null;
	const matches = team ? await teamMatches(locals.supabase, team.id, tz) : null;
	const options = matches?.ok ? matches.value : [];
	const match = options.find((m) => m.sessionId === url.searchParams.get('session')) ?? null;
	const side = match?.homeAway ?? 'home';
	const initial: Partial<HeaderInput> | undefined = team
		? {
				teamId: team.id,
				sessionId: match?.sessionId ?? '',
				playedOn: match?.playedOn ?? academyDate(new Date(), tz),
				startTime: match?.startTime ?? '',
				momentumSide: side,
				homeTeam: side === 'home' ? team.name : (match?.opponent ?? ''),
				awayTeam: side === 'home' ? (match?.opponent ?? '') : team.name,
				location: match?.location ?? ''
			}
		: undefined;
	return {
		teams: all.map((t) => ({ value: t.id, label: `${t.name} · ${t.season}` })),
		team: team ? { id: team.id, name: team.name } : null,
		matches: options.map((m) => ({ value: m.sessionId, label: m.label })),
		sessionId: match?.sessionId ?? '',
		form: initial
			? await superValidate(initial, zod4(headerSchema), { errors: false })
			: await superValidate(zod4(headerSchema)),
		loadError: !teams.ok
			? describeError(teams.error.code)
			: matches && !matches.ok
				? describeError(matches.error.code)
				: null
	};
};

export const actions: Actions = {
	create: async ({ request, locals }) => {
		const form = await superValidate(request, zod4(headerSchema));
		if (!form.valid) return fail(400, { form });
		const made = await createScorecard(locals.supabase, form.data, locals.user!.id);
		if (!made.ok)
			return setError(
				form,
				'',
				made.error.code === 'conflict'
					? 'A card for that match or session already exists.'
					: describeError(made.error.code),
				{ status: 400 }
			);
		redirect(303, `/coach/scorecards/${made.value.id}`);
	}
};
