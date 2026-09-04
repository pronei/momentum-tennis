import { describe, expect, it } from 'vitest';
import { called, fakeDb } from '../schedule/fakes';
import { balances, grantCredits, grantSchema, ledger } from './credits';

const PLAYER = '11111111-1111-1111-1111-111111111111';
const TOKEN = '22222222-2222-2222-2222-222222222222';

describe('balances — what a family has, including the kinds they have none of', () => {
	it('fills every credit kind, so "no weekend credits" is a line and not a silence', async () => {
		const calls: unknown[] = [];
		const db = fakeDb({
			calls,
			tables: {
				v_credit_balances: {
					data: [
						{
							player_id: PLAYER,
							credit_kind: 'class_weekday',
							balance: 7,
							next_expiry: '2026-11-20T00:00:00Z'
						}
					]
				}
			}
		});
		const result = await balances(db, PLAYER);
		expect(result.ok).toBe(true);
		if (!result.ok) return;
		expect(result.value).toEqual([
			{ creditKind: 'class_weekday', balance: 7, nextExpiry: '2026-11-20T00:00:00Z' },
			{ creditKind: 'class_weekend', balance: 0, nextExpiry: null },
			{ creditKind: 'private_lesson', balance: 0, nextExpiry: null }
		]);
		expect(called(calls, 'eq', 'player_id', PLAYER)).toBe(true);
	});

	it('reports a refused read rather than an empty wallet', async () => {
		const db = fakeDb({
			tables: { v_credit_balances: { error: { message: 'denied', code: '42501' } } }
		});
		const result = await balances(db, PLAYER);
		expect(result.ok).toBe(false);
		if (result.ok) return;
		expect(result.error.code).toBe('not_authorized');
	});
});

describe('ledger — the append-only history, newest first', () => {
	it('maps entries and keeps the sign of every delta', async () => {
		const calls: unknown[] = [];
		const db = fakeDb({
			calls,
			tables: {
				credit_ledger: {
					data: [
						{
							id: 'l2',
							entry_type: 'consume',
							delta: -1,
							credit_kind: 'class_weekday',
							reason: null,
							created_at: '2026-09-14T16:00:00Z'
						},
						{
							id: 'l1',
							entry_type: 'adjust',
							delta: 10,
							credit_kind: 'class_weekday',
							reason: 'trial pack',
							created_at: '2026-09-01T00:00:00Z'
						}
					]
				}
			}
		});
		const result = await ledger(db, PLAYER);
		expect(result.ok).toBe(true);
		if (!result.ok) return;
		expect(result.value[0]).toEqual({
			id: 'l2',
			entryType: 'consume',
			delta: -1,
			creditKind: 'class_weekday',
			reason: null,
			createdAt: '2026-09-14T16:00:00Z'
		});
		expect(called(calls, 'order', 'created_at')).toBe(true);
	});
});

describe('grantSchema — an admin grant is deliberate, so it says why', () => {
	const base = {
		playerId: PLAYER,
		kind: 'class_weekday',
		quantity: 10,
		reason: 'Trial',
		token: TOKEN
	};
	it('accepts a well-formed grant', () => {
		expect(grantSchema.safeParse(base).success).toBe(true);
	});
	it('refuses a missing reason — a credit that appears with no explanation is unauditable', () => {
		expect(grantSchema.safeParse({ ...base, reason: '  ' }).success).toBe(false);
	});
	it('refuses a non-positive or absurd quantity', () => {
		expect(grantSchema.safeParse({ ...base, quantity: 0 }).success).toBe(false);
		expect(grantSchema.safeParse({ ...base, quantity: 1000 }).success).toBe(false);
	});
	it('refuses a credit kind the academy does not issue', () => {
		expect(grantSchema.safeParse({ ...base, kind: 'gift_card' }).success).toBe(false);
	});
});

describe('grantCredits — through issue_credits, the one issuance path', () => {
	it('keys the grant on the form token so a double submit issues once', async () => {
		const calls: unknown[] = [];
		const db = fakeDb({ calls, rpc: { data: 'lot-1' } });
		const result = await grantCredits(db, {
			playerId: PLAYER,
			kind: 'class_weekday',
			quantity: 10,
			reason: 'Trial pack',
			token: TOKEN
		});
		expect(result).toEqual({ ok: true, value: { lotId: 'lot-1' } });
		expect(
			called(calls, 'rpc', 'issue_credits', {
				p_player: PLAYER,
				p_kind: 'class_weekday',
				p_quantity: 10,
				p_idempotency_key: `grant:${TOKEN}`,
				p_reason: 'Trial pack'
			})
		).toBe(true);
	});

	it('a repeat of the same token issues nothing and is not an error', async () => {
		const db = fakeDb({ rpc: { data: null } });
		const result = await grantCredits(db, {
			playerId: PLAYER,
			kind: 'class_weekday',
			quantity: 10,
			reason: 'Trial pack',
			token: TOKEN
		});
		expect(result).toEqual({ ok: true, value: { lotId: null } });
	});

	it('maps the RPC refusals', async () => {
		const denied = fakeDb({ rpc: { error: { message: 'admin_only' } } });
		const r1 = await grantCredits(denied, {
			playerId: PLAYER,
			kind: 'class_weekday',
			quantity: 1,
			reason: 'x',
			token: TOKEN
		});
		expect(r1.ok).toBe(false);
		if (!r1.ok) expect(r1.error.code).toBe('admin_only');
	});
});
