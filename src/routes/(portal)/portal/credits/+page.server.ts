import { balances, CREDIT_LABELS, ledger } from '$lib/server/domain/booking/credits';
import { describeError } from '$lib/server/domain/result';
import { getAcademySettings } from '$lib/server/domain/settings';
import { academyDate } from '$lib/server/domain/time';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, parent }) => {
	const { currentPlayer } = await parent();
	const settings = await getAcademySettings(locals.supabase);
	if (!currentPlayer) return { balances: [], entries: [], lowThreshold: 0, loadError: null };

	const [wallet, history] = await Promise.all([
		balances(locals.supabase, currentPlayer.id),
		ledger(locals.supabase, currentPlayer.id)
	]);

	return {
		lowThreshold: settings.lowCreditThreshold,
		balances: (wallet.ok ? wallet.value : []).map((b) => ({
			...b,
			label: CREDIT_LABELS[b.creditKind],
			expiresOn: b.nextExpiry ? academyDate(b.nextExpiry, settings.timezone) : null
		})),
		entries: (history.ok ? history.value : []).map((e) => ({
			id: e.id,
			// the ledger is append-only, so a correction is a new row and the sign is the whole story
			movement: `${e.delta > 0 ? '+' : ''}${e.delta}`,
			entryType: e.entryType.replace('_', ' '),
			kind: CREDIT_LABELS[e.creditKind],
			reason: e.reason,
			on: academyDate(e.createdAt, settings.timezone)
		})),
		// the ledger is gated on can_view_financials, so a minor's own login sees the refusal here
		loadError: !wallet.ok
			? describeError(wallet.error.code)
			: !history.ok
				? describeError(history.error.code)
				: null
	};
};
