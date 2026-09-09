import type { SupabaseClient } from '@supabase/supabase-js';
import { paymentReceipt } from '$lib/ds/email/paymentReceipt';
import type { Config } from '$lib/server/config';
import type { Database } from '$lib/server/db/database.types';
import { consoleMailer, resendMailer, supabaseSendStore } from '../notify/adapters';
import { sendTransactional, type Mailer, type SendStore } from '../notify/send';
import { getAcademySettings } from '../settings';
import { academyDate } from '../time';
import { getOrder } from './orders';
import { formatMoney } from './products';

// The receipt. Like the booking confirmation it runs on the SERVICE-ROLE client — notification_sends
// has no insert policy for a family — and it never throws: settlement already happened, the credits
// are in the ledger, and a mail provider having a bad minute must not turn that into an error the
// webhook retries. The trigger key is the order, so a redelivered event cannot send a second copy.

export type ReceiptDeps = { store?: SendStore; mailer?: Mailer };

type LotRow = { delta: number; expires_at: string | null; player_id: string };

export async function sendReceipt(
	db: SupabaseClient<Database>,
	cfg: Config,
	orderId: string,
	deps: ReceiptDeps = {}
): Promise<boolean> {
	try {
		const order = await getOrder(db, orderId);
		if (!order.ok || !order.value) return false;
		const o = order.value;
		if (!o.accountEmail) return false;

		const [settings, lots] = await Promise.all([
			getAcademySettings(db),
			db
				.from('credit_ledger')
				.select('delta, expires_at, player_id')
				.in(
					'order_item_id',
					o.items.map((i) => i.id)
				)
				.eq('entry_type', 'purchase')
		]);
		const tz = settings.timezone;
		const nameOf = new Map(o.items.map((i) => [i.playerId, i.playerName]));

		const creditLines = ((lots.data ?? []) as unknown as LotRow[]).map((l) =>
			[
				`${l.delta} CREDITS ISSUED`,
				(nameOf.get(l.player_id) ?? '').toUpperCase(),
				l.expires_at ? `EXPIRES ${academyDate(l.expires_at, tz)}` : ''
			]
				.filter(Boolean)
				.join(' · ')
		);

		const mail = paymentReceipt({
			// a uuid is not something a family should have to read out; eight characters identify it
			orderRef: `ORDER ${o.id.slice(0, 8).toUpperCase()}`,
			items: o.items.map((i) => ({
				name: i.productName,
				playerName: i.playerName,
				amount: formatMoney(i.unitAmountCents * i.quantity, o.currency)
			})),
			total: formatMoney(o.amountCents, o.currency),
			date: academyDate(o.paidAt ?? o.createdAt, tz),
			creditsLine: creditLines.length ? creditLines.join(' · ') : null,
			stripeRef: o.paymentIntentId ? o.paymentIntentId.toUpperCase() : null,
			receiptUrl: `${cfg.siteUrl}/portal/purchases/${o.id}`
		});

		// Resend when a key is configured, otherwise print: an environment without a mail key must
		// still be able to sell a pack.
		const mailer =
			deps.mailer ??
			(cfg.secrets.RESEND_API_KEY
				? resendMailer(cfg.secrets.RESEND_API_KEY, cfg.emailFrom)
				: consoleMailer());
		const outcome = await sendTransactional(deps.store ?? supabaseSendStore(db), mailer, {
			triggerKey: `receipt:order:${o.id}`,
			recipientAccountId: o.accountId,
			playerId: o.items[0]?.playerId,
			to: o.accountEmail,
			template: 'payment-receipt',
			subject: mail.subject,
			html: mail.html,
			text: mail.text
		});
		return outcome === 'sent';
	} catch {
		return false;
	}
}
