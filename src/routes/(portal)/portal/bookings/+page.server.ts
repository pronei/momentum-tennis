import { fail } from '@sveltejs/kit';
import { cancelClass, cancellationNotice, listBookings } from '$lib/server/domain/booking/classes';
import { waitlistPosition } from '$lib/server/domain/booking/waitlist';
import { describeError } from '$lib/server/domain/result';
import { getAcademySettings } from '$lib/server/domain/settings';
import { academyDate, academyTime } from '$lib/server/domain/time';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, parent }) => {
	const { currentPlayer } = await parent();
	const settings = await getAcademySettings(locals.supabase);
	if (!currentPlayer) return { settings, upcoming: [], past: [], loadError: null };

	const held = await listBookings(locals.supabase, { playerId: currentPlayer.id });
	if (!held.ok) {
		return { settings, upcoming: [], past: [], loadError: describeError(held.error.code) };
	}

	const tz = settings.timezone;
	const decorate = async (b: (typeof held.value.upcoming)[number]) => {
		const position =
			b.status === 'waitlisted'
				? await waitlistPosition(locals.supabase, {
						sessionId: b.sessionId,
						playerId: currentPlayer.id
					})
				: null;
		return {
			id: b.id,
			status: b.status,
			sessionCancelled: b.sessionCancelled,
			date: academyDate(b.startsAt, tz),
			hours: `${academyTime(b.startsAt, tz)}–${academyTime(b.endsAt, tz)}`,
			// the rule stated before the guardian confirms, mirroring cancel_booking's own >=
			notice: cancellationNotice(b.startsAt, settings.cancelNoticeHours),
			waitlistPosition: position?.ok ? position.value : null
		};
	};

	return {
		settings,
		upcoming: await Promise.all(held.value.upcoming.map(decorate)),
		past: await Promise.all(held.value.past.map(decorate)),
		loadError: null
	};
};

export const actions: Actions = {
	cancel: async ({ request, locals }) => {
		const bookingId = String((await request.formData()).get('bookingId') ?? '');
		if (!bookingId) return fail(400, { cancelError: describeError('validation') });
		const result = await cancelClass(locals.supabase, bookingId);
		if (!result.ok) return fail(400, { cancelError: describeError(result.error.code) });
		return {
			cancelled: result.value.status,
			forgiven: result.value.forgiven,
			promoted: result.value.promoted
		};
	}
};
