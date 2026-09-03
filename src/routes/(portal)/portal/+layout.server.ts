import { ageOn, isAdultOn } from '$lib/server/domain/identity/age';
import { listPlayers } from '$lib/server/domain/identity/players';
import { describeError } from '$lib/server/domain/result';
import { needsReconsent, playerWaiverStatus } from '$lib/server/domain/waivers';
import type { LayoutServerLoad } from './$types';

/**
 * The portal shell's facts: the account, the players this guardian actively guards, and which
 * one the page is about (`?player=`). Age is derived here, on the server, against the academy
 * timezone — the same rule `player_is_adult()` applies, so the portal and the gate agree.
 * hooks.server.ts has already guaranteed a user.
 */
export const load: LayoutServerLoad = async ({ locals, url, parent }) => {
	const { tz } = await parent();
	const [{ data: account }, playersResult] = await Promise.all([
		locals.supabase
			.from('accounts')
			.select('full_name, email, phone')
			.eq('id', locals.user!.id)
			.maybeSingle(),
		listPlayers(locals.supabase, locals.user!.id)
	]);

	const players = (playersResult.ok ? playersResult.value : []).map((p) => ({
		...p,
		age: ageOn(p.birthdate, tz),
		isAdult: isAdultOn(p.birthdate, tz)
	}));
	const requested = url.searchParams.get('player');
	const currentPlayer = players.find((p) => p.id === requested) ?? players[0] ?? null;

	// Consent status for whoever the page is about: the re-consent banner and phase 4's
	// booking gate read the same view, so they can never disagree.
	const status = currentPlayer ? await playerWaiverStatus(locals.supabase, currentPlayer.id) : null;
	const waiverStatus = status?.ok ? status.value : [];

	return {
		waiverStatus,
		reconsentNeeded: needsReconsent(waiverStatus),
		account: account ?? { full_name: '', email: locals.user!.email ?? '', phone: null },
		players,
		currentPlayer,
		// an empty roster and a failed query must not look the same
		playersError: playersResult.ok ? null : describeError(playersResult.error.code)
	};
};
