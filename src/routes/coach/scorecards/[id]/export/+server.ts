import { error, json } from '@sveltejs/kit';
import { describeError } from '$lib/server/domain/result';
import { getScorecard } from '$lib/server/domain/scorecards/cards';
import { exportFilename, observedCard } from '$lib/server/domain/scorecards/export';
import type { RequestHandler } from './$types';

/** The observed card the TennisLink automation imports. Final cards only. */
export const GET: RequestHandler = async ({ params, locals }) => {
	const found = await getScorecard(locals.supabase, params.id);
	if (!found.ok) error(500, describeError(found.error.code));
	if (!found.value) error(404, 'No such scorecard');
	const { card, lines } = found.value;
	if (card.status !== 'final') error(409, 'Only a final card exports');
	return json(observedCard(card, lines, new Date().toISOString()), {
		headers: { 'content-disposition': `attachment; filename="${exportFilename(card)}"` }
	});
};
