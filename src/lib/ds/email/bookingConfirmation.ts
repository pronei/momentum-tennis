// Ported from design-system/templates/email/booking-confirmation.html.
//
// Email templates live under src/lib/ds because they ARE the ported design system: the email kit's
// inline hex is the one recorded exception to the tokens-only rule (see
// design-system/templates/email/README.md), and src/lib/ds is the directory the adherence gate
// exempts as the reference port. They are not exported from the component barrel — nothing here is
// a Svelte component, and a string builder has no business in a client bundle.
//
// One deviation from the reference: the navy header bar carries the wordmark as text rather than
// <img src="../../assets/wordmark-field.png">. The reference marks that path "PRODUCTION: swap for
// a hosted absolute URL", and no hosted asset exists yet; a broken image is worse than type.

export type BookingConfirmation = {
	playerName: string;
	title: string;
	/** YYYY-MM-DD in academy time */
	date: string;
	/** e.g. SAT */
	weekday: string;
	/** e.g. 16:00–18:00 */
	hours: string;
	location: string;
	coach?: string | null;
	creditsLeft: number;
	bookingUrl: string;
};

const esc = (s: string) =>
	s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
const stamp = (date: string) => {
	const [, m, d] = date.split('-');
	return `${MONTHS[Number(m) - 1]} ${Number(d)}`;
};

const mono = "font-family:'IBM Plex Mono','Courier New',Courier,monospace";
const sans = "font-family:'IBM Plex Sans',Helvetica,Arial,sans-serif";
const row = (label: string, value: string) =>
	`<p style="margin:0 0 6px;${mono};font-size:12px;letter-spacing:0.5px;text-transform:uppercase;color:#1B1B1B;"><span style="color:#46525E;">${label}</span>&nbsp;&nbsp;${esc(value)}</p>`;

/** Subject, plain text and HTML. The text version carries every fact the HTML does. */
export function bookingConfirmation(b: BookingConfirmation): {
	subject: string;
	text: string;
	html: string;
} {
	const when = `${b.date} (${b.weekday.toUpperCase()}) ${b.hours}`;
	const subject = `Booking confirmed — ${b.title} · ${b.date} ${b.hours}`;

	const text = [
		`Booking confirmed.`,
		``,
		`${b.playerName} is booked. Arrive ten minutes early — classes start on the first frame.`,
		``,
		`SESSION   ${b.title}`,
		`DATE      ${b.date} (${b.weekday.toUpperCase()})`,
		`TIME      ${b.hours}`,
		`LOCATION  ${b.location}`,
		`PLAYER    ${b.playerName}`,
		...(b.coach ? [`COACH     ${b.coach}`] : []),
		`CREDITS   ${b.creditsLeft} remaining`,
		``,
		`View the booking: ${b.bookingUrl}`,
		``,
		`You received this because a class was booked on your Momentum Tennis account.`,
		`Momentum Tennis · Cupertino, CA`
	].join('\n');

	const html = `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light"><title>Booking confirmed — Momentum Tennis</title></head><body style="margin:0;padding:0;background:#F7F7F7;">
<span style="display:none;max-height:0;overflow:hidden;mso-hide:all;">${esc(b.title)} · ${esc(when)} · ${esc(b.location)}</span>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F7F7F7;"><tr><td align="center" style="padding:24px 12px;">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:600px;max-width:100%;background:#FFFFFF;border:1px solid #D9D9D9;">
<tr><td style="background:#1C3655;padding:18px 32px;"><span style="${mono};font-size:13px;letter-spacing:2px;text-transform:uppercase;color:#F7F7F7;">MOMENTUM TENNIS</span></td></tr>
<tr><td style="padding:32px;">
<p style="margin:0 0 12px;${mono};font-size:11px;letter-spacing:1.2px;text-transform:uppercase;color:#2B5680;">CONFIRMED · ${stamp(b.date)}</p>
<h1 style="margin:0 0 16px;font-family:'Chivo',Helvetica,Arial,sans-serif;font-weight:900;font-size:26px;line-height:1.1;letter-spacing:0.3px;text-transform:uppercase;color:#1B1B1B;">Booking confirmed.</h1>
<p style="margin:0 0 16px;${sans};font-size:15px;line-height:1.6;color:#1B1B1B;">${esc(b.playerName)} is booked. Arrive ten minutes early — classes start on the first frame.</p>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#EEF3F7;margin:0 0 20px;"><tr><td style="padding:16px 20px;">
${row('SESSION', b.title)}${row('DATE', `${b.date} (${b.weekday.toUpperCase()})`)}${row('TIME', b.hours)}${row('LOCATION', b.location)}${row('PLAYER', b.playerName)}${b.coach ? row('COACH', b.coach) : ''}${row('CREDITS', `${b.creditsLeft} remaining`)}
</td></tr></table>
<table role="presentation" cellpadding="0" cellspacing="0" style="margin:8px 0 4px;"><tr><td bgcolor="#E8A33D" style="border-radius:999px;"><a href="${esc(b.bookingUrl)}" style="display:inline-block;padding:15px 32px;${sans};font-size:13px;font-weight:600;letter-spacing:1.4px;text-transform:uppercase;color:#1B1B1B;text-decoration:none;border-radius:999px;">View booking</a></td></tr></table>
</td></tr>
<tr><td style="padding:20px 32px 24px;border-top:1px solid #D9D9D9;">
<p style="margin:0 0 6px;${mono};font-size:11px;line-height:1.7;letter-spacing:0.5px;text-transform:uppercase;color:#46525E;">YOU RECEIVED THIS BECAUSE A CLASS WAS BOOKED ON YOUR MOMENTUM TENNIS ACCOUNT.</p>
<p style="margin:0;${mono};font-size:11px;line-height:1.7;letter-spacing:0.5px;text-transform:uppercase;color:#46525E;">MOMENTUM TENNIS · CUPERTINO, CA</p>
</td></tr></table></td></tr></table></body></html>`;

	return { subject, text, html };
}
