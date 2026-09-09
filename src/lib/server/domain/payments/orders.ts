import type { Database } from '$lib/server/db/database.types';
import { err, fromPostgres, ok, type Result } from '../result';
import type { CreditKind, PaymentsDb } from './products';

// Orders are written only by the 0009 RPCs (create / settle / cancel / refund) and read through RLS:
// a family sees its own, an admin sees all. Nothing here computes a price or a balance.

export type OrderStatus = Database['public']['Enums']['order_status'];
export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
	pending: 'PENDING',
	paid: 'PAID',
	partially_refunded: 'PARTLY REFUNDED',
	refunded: 'REFUNDED',
	cancelled: 'CANCELLED'
};

export type OrderItem = {
	id: string;
	productId: string;
	productName: string;
	playerId: string;
	playerName: string;
	quantity: number;
	unitAmountCents: number;
};
export type OrderSummary = {
	id: string;
	/** the buying account — the receipt's recipient, and who a family's RLS scopes to */
	accountId: string;
	status: OrderStatus;
	amountCents: number;
	currency: string;
	createdAt: string;
	paidAt: string | null;
	paymentIntentId: string | null;
	checkoutSessionId: string | null;
	/** null when the reader may not see the account — a family reads only its own orders anyway */
	accountEmail: string | null;
	items: OrderItem[];
};
export type Lot = {
	lotId: string;
	playerId: string;
	creditKind: CreditKind;
	issued: number;
	remaining: number;
	expiresAt: string | null;
};

type ItemRow = {
	id: string;
	product_id: string;
	quantity: number;
	unit_amount_cents: number;
	player_id: string;
	products: { name: string } | null;
	players: { full_name: string } | null;
};
type OrderRow = {
	id: string;
	account_id: string;
	status: OrderStatus;
	amount_total_cents: number;
	currency: string;
	created_at: string;
	paid_at: string | null;
	stripe_payment_intent_id: string | null;
	stripe_checkout_session_id: string | null;
	accounts: { email: string } | null;
	order_items: ItemRow[] | null;
};
type LotRow = {
	id: string;
	player_id: string;
	credit_kind: CreditKind;
	delta: number;
	expires_at: string | null;
};

const SELECT =
	'id, account_id, status, amount_total_cents, currency, created_at, paid_at, stripe_payment_intent_id, stripe_checkout_session_id, accounts ( email ), order_items ( id, product_id, quantity, unit_amount_cents, player_id, products ( name ), players ( full_name ) )';

const fromRow = (r: OrderRow): OrderSummary => ({
	id: r.id,
	accountId: r.account_id,
	status: r.status,
	amountCents: r.amount_total_cents,
	currency: r.currency,
	createdAt: r.created_at,
	paidAt: r.paid_at,
	paymentIntentId: r.stripe_payment_intent_id,
	checkoutSessionId: r.stripe_checkout_session_id,
	accountEmail: r.accounts?.email ?? null,
	items: (r.order_items ?? []).map((i) => ({
		id: i.id,
		productId: i.product_id,
		productName: i.products?.name ?? '—',
		playerId: i.player_id,
		playerName: i.players?.full_name ?? '—',
		quantity: i.quantity,
		unitAmountCents: i.unit_amount_cents
	}))
});

/** A guardian's intent to buy: the database prices it and refuses what it must. */
export async function createOrder(
	db: PaymentsDb,
	input: { productId: string; playerId: string }
): Promise<Result<{ orderId: string }>> {
	const { data, error } = await db.rpc('create_order', {
		p_product: input.productId,
		p_player: input.playerId
	});
	if (error) return err(fromPostgres(error));
	return ok({ orderId: data as string });
}

export async function listOrders(
	db: PaymentsDb,
	opts: { status?: OrderStatus; limit?: number }
): Promise<Result<OrderSummary[]>> {
	let query = db.from('orders').select(SELECT);
	if (opts.status) query = query.eq('status', opts.status);
	const { data, error } = await query
		.order('created_at', { ascending: false })
		.limit(opts.limit ?? 50);
	if (error) return err(fromPostgres(error));
	return ok(((data ?? []) as unknown as OrderRow[]).map(fromRow));
}

export async function getOrder(db: PaymentsDb, id: string): Promise<Result<OrderSummary | null>> {
	const { data, error } = await db.from('orders').select(SELECT).eq('id', id).maybeSingle();
	if (error) return err(fromPostgres(error));
	return ok(data ? fromRow(data as unknown as OrderRow) : null);
}

/** The buyer abandons a pending order (or an admin expires it). Nothing was issued, nothing reverses. */
export async function cancelOrder(db: PaymentsDb, orderId: string): Promise<Result<void>> {
	const { error } = await db.rpc('cancel_order', { p_order: orderId });
	if (error) return err(fromPostgres(error));
	return ok(undefined);
}

/** The purchase lots an order issued, each with what is left of it — what a refund may reverse. */
export async function orderLots(db: PaymentsDb, orderId: string): Promise<Result<Lot[]>> {
	const items = await db.from('order_items').select('id').eq('order_id', orderId);
	if (items.error) return err(fromPostgres(items.error));
	const itemIds = (items.data ?? []).map((i) => i.id);
	if (!itemIds.length) return ok([]);

	const lots = await db
		.from('credit_ledger')
		.select('id, player_id, credit_kind, delta, expires_at')
		.in('order_item_id', itemIds)
		.eq('entry_type', 'purchase');
	if (lots.error) return err(fromPostgres(lots.error));
	const rows = (lots.data ?? []) as unknown as LotRow[];
	if (!rows.length) return ok([]);

	const left = await db
		.from('v_lot_remaining')
		.select('lot_id, remaining')
		.in(
			'lot_id',
			rows.map((r) => r.id)
		);
	if (left.error) return err(fromPostgres(left.error));
	const remaining = new Map(
		((left.data ?? []) as unknown as { lot_id: string; remaining: number }[]).map((r) => [
			r.lot_id,
			r.remaining
		])
	);
	return ok(
		rows.map((r) => ({
			lotId: r.id,
			playerId: r.player_id,
			creditKind: r.credit_kind,
			issued: r.delta,
			remaining: remaining.get(r.id) ?? 0,
			expiresAt: r.expires_at
		}))
	);
}

/**
 * Phase 5 policy (plan, question 2): a pack refunds in full only while nobody has drawn on it.
 * The database enforces the same rule in refund_order; this exists so the page can say so first.
 */
export const refundable = (lots: Lot[]): boolean =>
	lots.length > 0 && lots.every((l) => l.remaining === l.issued);
