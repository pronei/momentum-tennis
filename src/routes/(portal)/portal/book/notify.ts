import { bookingConfirmation } from '$lib/ds/email/bookingConfirmation';
import { createAdminSupabase } from '$lib/server/db/admin';
import { balances } from '$lib/server/domain/booking/credits';
import { consoleMailer, resendMailer, supabaseSendStore } from '$lib/server/domain/notify/adapters';
import { sendTransactional } from '$lib/server/domain/notify/send';
import { getConfig } from '$lib/server/config.runtime';
import { getAcademySettings } from '$lib/server/domain/settings';
import { academyDate, academyTime } from '$lib/server/domain/time';

// The confirmation. Two things this deliberately does:
//
// It uses the SERVICE-ROLE client, because notification_sends has no insert policy for a family —
// a client that could write that table could forge a send. The recipient is never taken from the
// request: it is the account making the booking, read back from the database.
//
// And it never throws. A booking that succeeded must not be reported as failed because a mail
// provider was slow, so every failure here becomes `false` and the booking still stands.

type Locals = App.Locals;

export async function notifyBooking(
	locals: Locals,
	input: { playerId: string; sessionId: string; bookingId: string }
): Promise<boolean> {
	try {
		const cfg = getConfig();
		const settings = await getAcademySettings(locals.supabase);
		const [{ data: session }, { data: player }, wallet] = await Promise.all([
			locals.supabase
				.from('v_schedule_sessions')
				.select('title, starts_at, ends_at, court_name, location_name, coach_name')
				.eq('id', input.sessionId)
				.maybeSingle(),
			locals.supabase.from('players').select('full_name').eq('id', input.playerId).maybeSingle(),
			balances(locals.supabase, input.playerId)
		]);
		if (!session || !player || !locals.user?.email) return false;

		const tz = settings.timezone;
		const weekday = new Intl.DateTimeFormat('en-US', { timeZone: tz, weekday: 'short' }).format(
			new Date(session.starts_at as string)
		);
		const classCredits = wallet.ok
			? wallet.value
					.filter((b) => b.creditKind !== 'private_lesson')
					.reduce((n, b) => n + b.balance, 0)
			: 0;

		const mail = bookingConfirmation({
			playerName: player.full_name,
			title: (session.title as string) ?? 'Class',
			date: academyDate(session.starts_at as string, tz),
			weekday,
			hours: `${academyTime(session.starts_at as string, tz)}–${academyTime(session.ends_at as string, tz)}`,
			location: (session.court_name as string)
				? `${session.court_name} · ${session.location_name}`
				: ((session.location_name as string) ?? ''),
			coach: (session.coach_name as string) ?? null,
			creditsLeft: classCredits,
			bookingUrl: `${cfg.siteUrl}/portal/bookings`
		});

		const admin = createAdminSupabase();
		// Resend when a key is configured, otherwise print: an environment without a mail key must
		// still be able to book.
		const mailer = cfg.secrets.RESEND_API_KEY
			? resendMailer(cfg.secrets.RESEND_API_KEY, cfg.emailFrom)
			: consoleMailer();
		const outcome = await sendTransactional(supabaseSendStore(admin), mailer, {
			// keyed on the BOOKING: cancel and re-book is a second, legitimate confirmation
			triggerKey: `booking:${input.bookingId}`,
			recipientAccountId: locals.user.id,
			playerId: input.playerId,
			to: locals.user.email,
			template: 'booking-confirmation',
			subject: mail.subject,
			html: mail.html,
			text: mail.text
		});
		return outcome === 'sent';
	} catch {
		return false;
	}
}
