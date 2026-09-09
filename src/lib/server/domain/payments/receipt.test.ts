import { describe, expect, it, vi } from 'vitest';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '$lib/server/db/database.types';
import type { Config } from '$lib/server/config';
import type { Mailer, SendRequest, SendStore } from '../notify/send';
import { fakeDb, type Reply } from '../schedule/fakes';
import { sendReceipt } from './receipt';

const cfg = { siteUrl: 'https://example.test', emailFrom: 'a@b.test', secrets: {} } as Config;

const orderRow = {
	id: '3f2a9c1b-0000-4000-8000-000000000001',
	account_id: 'acc1',
	status: 'paid',
	amount_total_cents: 50000,
	currency: 'usd',
	created_at: '2026-09-05T12:00:00Z',
	paid_at: '2026-09-05T18:30:00Z',
	stripe_payment_intent_id: 'pi_fake_x',
	stripe_checkout_session_id: 'cs_fake_x',
	accounts: { email: 'family@example.test' },
	order_items: [
		{
			id: 'i1',
			product_id: 'p1',
			quantity: 1,
			unit_amount_cents: 50000,
			player_id: 'pl1',
			products: { name: 'Weekday classes' },
			players: { full_name: 'Eli W.' }
		}
	]
};
const lotRows = [{ delta: 10, expires_at: '2026-11-28T08:00:00Z', player_id: 'pl1' }];

function harness(over: { tables?: Record<string, Reply>; claim?: 'new' | 'duplicate' } = {}) {
	const sends: SendRequest[] = [];
	const store: SendStore = {
		claim: async (s) => {
			sends.push(s);
			return over.claim ?? 'new';
		},
		settle: async () => {}
	};
	const mail: { to: string; subject: string; html: string; text?: string }[] = [];
	const mailer: Mailer = {
		send: async (m) => {
			mail.push(m);
			return { id: 'msg_1' };
		}
	};
	const db = fakeDb({
		tables: {
			orders: { data: orderRow },
			credit_ledger: { data: lotRows },
			academy_settings: { data: { timezone: 'America/Los_Angeles' } },
			...over.tables
		}
	}) as unknown as SupabaseClient<Database>;
	return { db, store, mailer, sends, mail };
}

describe('sendReceipt — one receipt per order, and never a reason a purchase looks failed', () => {
	it('sends to the buying account, keyed on the order so a replay cannot send twice', async () => {
		const { db, store, mailer, sends, mail } = harness();
		expect(await sendReceipt(db, cfg, orderRow.id, { store, mailer })).toBe(true);
		expect(sends).toHaveLength(1);
		expect(sends[0]).toMatchObject({
			triggerKey: `receipt:order:${orderRow.id}`,
			template: 'payment-receipt',
			to: 'family@example.test',
			recipientAccountId: 'acc1',
			playerId: 'pl1',
			category: 'transactional'
		});
		expect(mail[0].to).toBe('family@example.test');
	});

	it('carries the order, the money, the academy date and the credits it issued', async () => {
		const { db, store, mailer, mail } = harness();
		await sendReceipt(db, cfg, orderRow.id, { store, mailer });
		const { subject, text } = mail[0];
		expect(subject).toBe('Receipt — Weekday classes · $500.00');
		expect(text).toContain('ORDER 3F2A9C1B');
		expect(text).toContain('$500.00');
		// paid_at is 18:30 UTC — 11:30 the same day in Cupertino
		expect(text).toContain('2026-09-05');
		expect(text).toContain('10 CREDITS ISSUED · ELI W. · EXPIRES 2026-11-28');
		expect(text).toContain('PI_FAKE_X');
		expect(text).toContain(`https://example.test/portal/purchases/${orderRow.id}`);
	});

	it('a duplicate claim sends nothing and answers false', async () => {
		const { db, store, mailer, mail } = harness({ claim: 'duplicate' });
		expect(await sendReceipt(db, cfg, orderRow.id, { store, mailer })).toBe(false);
		expect(mail).toHaveLength(0);
	});

	it('an order that issued no credits still gets a receipt, without a credits line', async () => {
		const { db, store, mailer, mail } = harness({ tables: { credit_ledger: { data: [] } } });
		expect(await sendReceipt(db, cfg, orderRow.id, { store, mailer })).toBe(true);
		expect(mail[0].text).not.toContain('CREDITS ISSUED');
	});

	it('a missing order, a missing email or a mailer that throws is false, never a throw', async () => {
		const gone = harness({ tables: { orders: { data: null } } });
		expect(await sendReceipt(gone.db, cfg, orderRow.id, gone)).toBe(false);

		const anon = harness({ tables: { orders: { data: { ...orderRow, accounts: null } } } });
		expect(await sendReceipt(anon.db, cfg, orderRow.id, anon)).toBe(false);

		const broken = harness();
		broken.mailer.send = async () => {
			throw new Error('resend is down');
		};
		const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
		expect(await sendReceipt(broken.db, cfg, orderRow.id, broken)).toBe(false);
		warn.mockRestore();
	});
});
