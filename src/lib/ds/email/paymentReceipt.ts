// Ported from design-system/templates/email/payment-receipt.html. The same two deviations
// bookingConfirmation records apply: the navy header carries the wordmark as text (no hosted
// asset exists yet), and the inline hex is the email kit's recorded tokens exception.
//
// The reference prints one item row; a receipt has as many as the order does, so ITEM repeats.
// A row with nothing to say is omitted rather than printed empty.

export type ReceiptItem = { name: string; playerName: string; amount: string };
export type PaymentReceipt = {
	/** e.g. ORDER 3F2A9C1B — the first eight of the uuid, which is what a family can quote */
	orderRef: string;
	items: ReceiptItem[];
	total: string;
	/** YYYY-MM-DD in academy time */
	date: string;
	/** e.g. 10 CREDITS ISSUED · ELI W. · EXPIRES 2026-12-05; null when the order issued none */
	creditsLine: string | null;
	stripeRef: string | null;
	receiptUrl: string;
};

const esc = (s: string) =>
	s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const mono = "font-family:'IBM Plex Mono','Courier New',Courier,monospace";
const sans = "font-family:'IBM Plex Sans',Helvetica,Arial,sans-serif";
const row = (label: string, value: string) =>
	`<p style="margin:0 0 6px;${mono};font-size:12px;letter-spacing:0.5px;text-transform:uppercase;color:#1B1B1B;"><span style="color:#46525E;">${label}</span>&nbsp;&nbsp;${esc(value)}</p>`;
const note = (value: string) =>
	`<p style="margin:0 0 6px;${mono};font-size:12px;letter-spacing:0.5px;text-transform:uppercase;color:#46525E;">${esc(value)}</p>`;

/** Subject, plain text and HTML. The text version carries every fact the HTML does. */
export function paymentReceipt(r: PaymentReceipt): {
	subject: string;
	text: string;
	html: string;
} {
	const first = r.items[0];
	const subject = `Receipt — ${first ? first.name : r.orderRef} · ${r.total}`;

	const text = [
		`Receipt.`,
		``,
		...r.items.map((i) => `ITEM      ${i.name} · ${i.playerName} · ${i.amount}`),
		`TOTAL     ${r.total}`,
		`DATE      ${r.date}`,
		`REF       ${r.orderRef}`,
		...(r.creditsLine ? [``, r.creditsLine] : []),
		...(r.stripeRef ? [`STRIPE REF ${r.stripeRef}`] : []),
		``,
		`View the receipt: ${r.receiptUrl}`,
		``,
		`You received this because a payment was made on your Momentum Tennis account.`,
		`Momentum Tennis · Cupertino, CA · 669-264-6756`
	].join('\n');

	const html = `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light"><title>Receipt — Momentum Tennis</title></head><body style="margin:0;padding:0;background:#F7F7F7;">
<span style="display:none;max-height:0;overflow:hidden;mso-hide:all;">${esc(r.orderRef)} · ${esc(r.total)}${r.creditsLine ? ` · ${esc(r.creditsLine)}` : ''}</span>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F7F7F7;"><tr><td align="center" style="padding:24px 12px;">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:600px;max-width:100%;background:#FFFFFF;border:1px solid #D9D9D9;">
<tr><td style="background:#1C3655;padding:18px 32px;"><span style="${mono};font-size:13px;letter-spacing:2px;text-transform:uppercase;color:#F7F7F7;">MOMENTUM TENNIS</span></td></tr>
<tr><td style="padding:32px;">
<p style="margin:0 0 12px;${mono};font-size:11px;letter-spacing:1.2px;text-transform:uppercase;color:#2B5680;">PAID · ${esc(r.orderRef)}</p>
<h1 style="margin:0 0 16px;font-family:'Chivo',Helvetica,Arial,sans-serif;font-weight:900;font-size:26px;line-height:1.1;letter-spacing:0.3px;text-transform:uppercase;color:#1B1B1B;">Receipt.</h1>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#EEF3F7;margin:0 0 20px;"><tr><td style="padding:16px 20px;">
${r.items.map((i) => row('ITEM', `${i.name} · ${i.playerName} · ${i.amount}`)).join('')}${row('TOTAL', r.total)}${row('DATE', r.date)}${row('REF', r.orderRef)}
</td></tr></table>
${r.creditsLine ? note(r.creditsLine) : ''}${r.stripeRef ? note(`STRIPE REF ${r.stripeRef}`) : ''}<div style="height:12px;"></div>
<table role="presentation" cellpadding="0" cellspacing="0" style="margin:8px 0 4px;"><tr><td bgcolor="#E8A33D" style="border-radius:999px;"><a href="${esc(r.receiptUrl)}" style="display:inline-block;padding:15px 32px;${sans};font-size:13px;font-weight:600;letter-spacing:1.4px;text-transform:uppercase;color:#1B1B1B;text-decoration:none;border-radius:999px;">View receipt</a></td></tr></table>
</td></tr>
<tr><td style="padding:20px 32px 24px;border-top:1px solid #D9D9D9;">
<p style="margin:0 0 6px;${mono};font-size:11px;line-height:1.7;letter-spacing:0.5px;text-transform:uppercase;color:#46525E;">YOU RECEIVED THIS BECAUSE A PAYMENT WAS MADE ON YOUR MOMENTUM TENNIS ACCOUNT.</p>
<p style="margin:0;${mono};font-size:11px;line-height:1.7;letter-spacing:0.5px;text-transform:uppercase;color:#46525E;">MOMENTUM TENNIS · CUPERTINO, CA · 669-264-6756</p>
</td></tr></table></td></tr></table></body></html>`;

	return { subject, text, html };
}
