import { fail } from '@sveltejs/kit';
import { bookClass } from '$lib/server/domain/booking';
import { listBookable } from '$lib/server/domain/booking/classes';
import { balances } from '$lib/server/domain/booking/credits';
import { describeError } from '$lib/server/domain/result';
import { getAcademySettings } from '$lib/server/domain/settings';
import { academyDate, academyTime } from '$lib/server/domain/time';
import { notifyBooking } from './notify';
import type { Actions, PageServerLoad } from './$types';

const WINDOW_DAYS = 21;

/** One row on the booking list — everything the page needs to say yes, no, or why not. */
type BookableRow = {
	id: string;
	title: string;
	hours: string;
	where: string;
	scope: 'weekday' | 'weekend';
	seatsLeft: number;
	waitlisted: number;
	alreadyBooked: boolean;
	weekBlocked: boolean;
};

export const load: PageServerLoad = async ({ locals, parent }) => {
	const { currentPlayer } = await parent();
	const settings = await getAcademySettings(locals.supabase);
	if (!currentPlayer) return { settings, days: [], balances: [], loadError: null };

	const from = academyDate(new Date(), settings.timezone);
	// never offer beyond the horizon: book_class refuses it, and a family should not see a button
	// that cannot work
	const days = Math.min(WINDOW_DAYS, settings.bookingHorizonDays);
	const [bookable, wallet] = await Promise.all([
		listBookable(locals.supabase, {
			playerId: currentPlayer.id,
			levelKey: currentPlayer.levelKey ?? null,
			from,
			days,
			tz: settings.timezone
		}),
		balances(locals.supabase, currentPlayer.id)
	]);

	const grouped = new Map<string, BookableRow[]>();
	for (const s of bookable.ok ? bookable.value : []) {
		const date = academyDate(s.startsAt, settings.timezone);
		grouped.set(date, [
			...(grouped.get(date) ?? []),
			{
				id: s.id,
				title: s.title,
				hours: `${academyTime(s.startsAt, settings.timezone)}–${academyTime(s.endsAt, settings.timezone)}`,
				where: s.courtName ? `${s.courtName} · ${s.locationName}` : '—',
				scope: s.scope,
				seatsLeft: s.seatsLeft,
				waitlisted: s.waitlisted,
				alreadyBooked: s.alreadyBooked,
				weekBlocked: s.weekBlocked
			}
		]);
	}

	return {
		settings,
		days: [...grouped.entries()].map(([date, sessions]) => ({ date, sessions })),
		balances: wallet.ok ? wallet.value : [],
		loadError: !bookable.ok
			? describeError(bookable.error.code)
			: !wallet.ok
				? describeError(wallet.error.code)
				: null
	};
};

export const actions: Actions = {
	default: async ({ request, locals }) => {
		const data = await request.formData();
		const sessionId = String(data.get('sessionId') ?? '');
		const playerId = String(data.get('playerId') ?? '');
		if (!sessionId || !playerId) return fail(400, { bookError: describeError('validation') });

		// Every rule lives in book_class: the waiver gate, the credit, the weekly cap, capacity and
		// the level tags, in one transaction. A refusal is shown in its own words.
		const result = await bookClass(locals.supabase, { playerId, sessionId });
		if (!result.ok) return fail(400, { bookError: describeError(result.error.code) });

		// A confirmation is part of booking, but never a reason to fail one.
		const mailed = await notifyBooking(locals, {
			playerId,
			sessionId,
			bookingId: result.value.bookingId
		});
		return { booked: result.value.bookingId, mailed };
	}
};
