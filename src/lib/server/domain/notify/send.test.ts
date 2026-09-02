import { describe, expect, it } from 'vitest';
import { sendMarketing, sendTransactional, type Mailer, type SendStore } from './send';

function memory() {
	const claimed = new Set<string>();
	const settled: unknown[] = [];
	const store: SendStore = {
		claim: async (s) =>
			claimed.has(s.triggerKey) ? 'duplicate' : (claimed.add(s.triggerKey), 'new'),
		settle: async (key, status, providerMessageId) =>
			void settled.push([key, status, providerMessageId])
	};
	const sent: unknown[] = [];
	const mailer: Mailer = { send: async (m) => (sent.push(m), { id: 'msg_1' }) };
	return { store, mailer, sent, settled };
}
const send = {
	triggerKey: 'class_reminder:s1:a1',
	recipientAccountId: 'a1',
	to: 'priya@example.com',
	template: 'class-reminder',
	subject: 'Tomorrow · Green Tue 16:00',
	html: '<p>…</p>'
};

describe('sendTransactional — insert-first idempotency: overlapping crons cannot double-send', () => {
	it('claims the trigger key, sends once, settles with the provider id', async () => {
		const { store, mailer, sent, settled } = memory();
		expect(await sendTransactional(store, mailer, send)).toBe('sent');
		expect(await sendTransactional(store, mailer, send)).toBe('duplicate');
		expect(sent).toHaveLength(1);
		expect(settled).toEqual([['class_reminder:s1:a1', 'sent', 'msg_1']]);
	});
	it('settles failed when the mailer throws, so the key is not silently lost', async () => {
		const { store, settled } = memory();
		const broken: Mailer = {
			send: async () => {
				throw new Error('resend down');
			}
		};
		await expect(sendTransactional(store, broken, send)).rejects.toThrow('resend down');
		expect(settled).toEqual([['class_reminder:s1:a1', 'failed', undefined]]);
	});
});

describe('sendMarketing — legally distinct: needs an explicit consent fact, never the transactional path', () => {
	it('refuses without consent and never touches the mailer', async () => {
		const { store, mailer, sent } = memory();
		expect(
			await sendMarketing(
				store,
				mailer,
				{ ...send, triggerKey: 'newsletter:2026-09:a1' },
				{ subscribed: false }
			)
		).toBe('no_consent');
		expect(sent).toHaveLength(0);
	});
	it('sends when subscribed and records the marketing category', async () => {
		const { store, mailer, sent } = memory();
		expect(
			await sendMarketing(
				store,
				mailer,
				{ ...send, triggerKey: 'newsletter:2026-09:a1' },
				{ subscribed: true }
			)
		).toBe('sent');
		expect(sent).toHaveLength(1);
	});
});
