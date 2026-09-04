import { z } from 'zod';
import type { Database } from '$lib/server/db/database.types';
import { err, fromPostgres, ok, type Result } from '$lib/server/domain/result';
// the shared zod primitives live with the schedule module; a second copy of a uuid regex
// would be one more thing that can drift
import { uuid } from '../schedule/common';
import type { BookingDb } from './index';

// Credits belong to a named player and are derived, never stored as a balance: v_credit_balances
// sums the lots, v_lot_remaining sums each lot's draws, and the ledger underneath is append-only.
// Issuance has exactly one path — issue_credits — whether it is a Stripe webhook (phase 5) or an
// admin grant. Nothing here adds, subtracts or corrects a number itself.

export type CreditKind = Database['public']['Enums']['credit_kind'];
export const CREDIT_KINDS = ['class_weekday', 'class_weekend', 'private_lesson'] as const;

export const CREDIT_LABELS: Record<CreditKind, string> = {
	class_weekday: 'Weekday classes',
	class_weekend: 'Weekend classes',
	private_lesson: 'Private lessons'
};

export type Balance = { creditKind: CreditKind; balance: number; nextExpiry: string | null };
export type LedgerEntry = {
	id: string;
	entryType: Database['public']['Enums']['ledger_entry_type'];
	delta: number;
	creditKind: CreditKind;
	reason: string | null;
	createdAt: string;
};

type BalanceRow = { credit_kind: CreditKind; balance: number; next_expiry: string | null };
type LedgerRow = {
	id: string;
	entry_type: LedgerEntry['entryType'];
	delta: number;
	credit_kind: CreditKind;
	reason: string | null;
	created_at: string;
};

/**
 * What this player can spend, every kind present. A kind the family has none of is a line reading
 * zero, not a missing row: "you have no weekend credits" is the answer they came for.
 */
export async function balances(db: BookingDb, playerId: string): Promise<Result<Balance[]>> {
	const { data, error } = await db
		.from('v_credit_balances')
		.select('credit_kind, balance, next_expiry')
		.eq('player_id', playerId);
	if (error) return err(fromPostgres(error));
	const rows = (data ?? []) as unknown as BalanceRow[];
	return ok(
		CREDIT_KINDS.map((kind) => {
			const row = rows.find((r) => r.credit_kind === kind);
			return {
				creditKind: kind,
				balance: row?.balance ?? 0,
				nextExpiry: row?.next_expiry ?? null
			};
		})
	);
}

/** The history behind the number. `read_ledger` gates this on can_view_financials, not this code. */
export async function ledger(
	db: BookingDb,
	playerId: string,
	limit = 100
): Promise<Result<LedgerEntry[]>> {
	const { data, error } = await db
		.from('credit_ledger')
		.select('id, entry_type, delta, credit_kind, reason, created_at')
		.eq('player_id', playerId)
		.order('created_at', { ascending: false })
		.limit(limit);
	if (error) return err(fromPostgres(error));
	return ok(
		((data ?? []) as unknown as LedgerRow[]).map((r) => ({
			id: r.id,
			entryType: r.entry_type,
			delta: r.delta,
			creditKind: r.credit_kind,
			reason: r.reason,
			createdAt: r.created_at
		}))
	);
}

export const grantSchema = z.object({
	playerId: uuid,
	kind: z.enum(CREDIT_KINDS),
	quantity: z.coerce.number().int().min(1, 'At least one').max(100, 'Too many at once'),
	reason: z
		.string()
		.trim()
		.min(1, 'Say why — a grant with no reason cannot be audited')
		.max(240, 'Too long'),
	// issued by the LOAD, not the action: a refresh or a double-click re-sends the same key and
	// issue_credits no-ops on conflict, so a slip of the mouse cannot grant twice
	token: uuid
});
export type GrantInput = z.infer<typeof grantSchema>;

/**
 * An admin grant, through the one issuance path. `p_product` stays null until phase 5, so validity
 * and the forgiveness allowance come from `academy_settings` — issue_credits snapshots both onto
 * the lot. A null return means the key was already used: that is the double-submit case, not a
 * failure.
 */
export async function grantCredits(
	db: BookingDb,
	input: GrantInput
): Promise<Result<{ lotId: string | null }>> {
	const { data, error } = await db.rpc('issue_credits', {
		p_player: input.playerId,
		p_kind: input.kind,
		p_quantity: input.quantity,
		p_idempotency_key: `grant:${input.token}`,
		p_reason: input.reason
	});
	if (error) return err(fromPostgres(error));
	return ok({ lotId: (data as string | null) ?? null });
}
