import { error, fail, redirect } from '@sveltejs/kit';
import { describeError } from '$lib/server/domain/result';
import {
	deleteDraft,
	finalize,
	getScorecard,
	reopen,
	saveCard,
	type RosterName
} from '$lib/server/domain/scorecards/cards';
import {
	fieldValues,
	parseHeader,
	parseLines,
	submittedFields
} from '$lib/server/domain/scorecards/form';
import {
	completeness,
	isDoubles,
	positionLabel,
	RESULT_LABELS,
	RESULTS,
	ROUNDS,
	totals
} from '$lib/server/domain/scorecards/format';
import { roster } from '$lib/server/domain/schedule/teams';
import type { Actions, PageServerLoad, RequestEvent } from './$types';

// hooks.server.ts has already refused anyone who is not staff. RLS decides the rest: a coach's
// write to a final card matches no row and comes back as `scorecard_final`.

async function cardAndRoster(event: Pick<RequestEvent, 'params' | 'locals'>) {
	const found = await getScorecard(event.locals.supabase, event.params.id);
	if (!found.ok) error(500, describeError(found.error.code));
	if (!found.value) error(404, 'No such scorecard');
	const names = await roster(event.locals.supabase, found.value.card.teamId);
	const members: RosterName[] = names.ok
		? names.value.map((m) => ({ playerId: m.playerId, fullName: m.fullName }))
		: [];
	return {
		...found.value,
		members,
		rosterError: names.ok ? null : describeError(names.error.code)
	};
}

export const load: PageServerLoad = async (event) => {
	const { card, lines, members, rosterError } = await cardAndRoster(event);
	return {
		card: {
			id: card.id,
			status: card.status,
			matchId: card.matchId,
			playedOn: card.playedOn,
			teamName: card.teamName,
			// The card prints home first whichever side Momentum is.
			title: `${card.homeTeam} vs ${card.awayTeam}`,
			finalizedOn: card.finalizedAt ? card.finalizedAt.slice(0, 10) : null
		},
		rounds: ROUNDS[card.format].map((positions, i) => ({
			round: i + 1,
			lines: positions.map((p) => ({
				position: p,
				label: positionLabel(p).toUpperCase(),
				doubles: isDoubles(p)
			}))
		})),
		fields: fieldValues(card, lines),
		suggestions: [...new Set(members.map((m) => m.fullName))].sort(),
		totals: totals(lines),
		readiness: completeness(card, lines),
		results: RESULTS.map((r) => ({ value: r, label: RESULT_LABELS[r] })),
		isAdmin: event.locals.roles.isAdmin,
		loadError: rosterError
	};
};

/** Parse and save the whole form. Returns the `fail` to send back, or null when saved. */
async function save(event: RequestEvent, data: FormData) {
	const header = parseHeader(data);
	const lines = parseLines(data);
	const errors = { ...header.errors, ...lines.errors };
	const fields = submittedFields(data);
	if (!header.value || Object.keys(errors).length)
		return fail(400, { fields, errors, saveError: describeError('validation') });
	const { members } = await cardAndRoster(event);
	const saved = await saveCard(
		event.locals.supabase,
		event.params.id,
		header.value,
		lines.lines,
		members
	);
	if (!saved.ok)
		return fail(400, { fields, errors: {}, saveError: describeError(saved.error.code) });
	return null;
}

export const actions: Actions = {
	save: async (event) => {
		const failed = await save(event, await event.request.formData());
		return failed ?? { saved: true };
	},

	// Save first, so what the coach sees is what the gate judges; then the trigger decides.
	finalize: async (event) => {
		const failed = await save(event, await event.request.formData());
		if (failed) return failed;
		const done = await finalize(event.locals.supabase, event.params.id);
		if (!done.ok)
			return fail(400, {
				finalizeError: [describeError(done.error.code), done.error.detail?.toUpperCase()]
					.filter(Boolean)
					.join(' ')
			});
		return { finalized: true };
	},

	reopen: async ({ params, locals }) => {
		const done = await reopen(locals.supabase, params.id);
		if (!done.ok) return fail(400, { actionError: describeError(done.error.code) });
		return { reopened: true };
	},

	delete: async ({ params, locals }) => {
		const done = await deleteDraft(locals.supabase, params.id);
		if (!done.ok) return fail(400, { actionError: describeError(done.error.code) });
		redirect(303, '/coach/scorecards');
	}
};
