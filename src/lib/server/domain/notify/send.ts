// Notification classes are legally distinct. Transactional sends (confirmations, reminders,
// nudges, re-consent) need no opt-in; marketing needs an explicit consent fact and can never be
// routed through the transactional function — the type signatures make that impossible.
// Idempotency is insert-first on trigger_key: overlapping cron runs cannot double-send.

export type SendCategory = 'transactional' | 'marketing';
export type SendRequest = {
	/** e.g. class_reminder:{session}:{account}, low_credits:{player}:{lot}, newsletter:{issue}:{account} */
	triggerKey: string;
	recipientAccountId: string;
	playerId?: string;
	to: string;
	template: string;
	subject: string;
	html: string;
	text?: string;
};
export type SendOutcome = 'sent' | 'duplicate';

export interface SendStore {
	claim(send: SendRequest & { category: SendCategory }): Promise<'new' | 'duplicate'>;
	settle(triggerKey: string, status: 'sent' | 'failed', providerMessageId?: string): Promise<void>;
}
export interface Mailer {
	send(mail: { to: string; subject: string; html: string; text?: string }): Promise<{ id: string }>;
}

async function deliver(
	store: SendStore,
	mailer: Mailer,
	send: SendRequest,
	category: SendCategory
): Promise<SendOutcome> {
	if ((await store.claim({ ...send, category })) === 'duplicate') return 'duplicate';
	try {
		const { id } = await mailer.send({
			to: send.to,
			subject: send.subject,
			html: send.html,
			text: send.text
		});
		await store.settle(send.triggerKey, 'sent', id);
		return 'sent';
	} catch (e) {
		await store.settle(send.triggerKey, 'failed');
		throw e;
	}
}

export const sendTransactional = (store: SendStore, mailer: Mailer, send: SendRequest) =>
	deliver(store, mailer, send, 'transactional');

export async function sendMarketing(
	store: SendStore,
	mailer: Mailer,
	send: SendRequest,
	consent: { subscribed: boolean }
): Promise<SendOutcome | 'no_consent'> {
	if (!consent.subscribed) return 'no_consent';
	return deliver(store, mailer, send, 'marketing');
}
