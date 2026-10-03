import { describeError } from '$lib/server/domain/result';
import { listScorecards } from '$lib/server/domain/scorecards/cards';
import type { PageServerLoad } from './$types';

// hooks.server.ts has already refused anyone who is not staff.

export const load: PageServerLoad = async ({ locals }) => {
	const cards = await listScorecards(locals.supabase);
	return {
		rows: (cards.ok ? cards.value : []).map((c) => ({
			id: c.id,
			on: c.playedOn,
			team: c.teamName,
			match: c.momentumSide === 'home' ? `vs ${c.awayTeam}` : `at ${c.homeTeam}`,
			matchId: c.matchId ?? '—',
			status: c.status.toUpperCase()
		})),
		loadError: cards.ok ? null : describeError(cards.error.code)
	};
};
