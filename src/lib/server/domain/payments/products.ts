import type { SupabaseClient } from '@supabase/supabase-js';
import { z } from 'zod';
import type { Database } from '$lib/server/db/database.types';
import { AppError, err, fromPostgres, ok, type Result } from '../result';
import { CREDIT_KINDS } from '../booking/credits';
import { uuid } from '../schedule/common';

// The catalogue. Reads go through RLS (anyone sees active products, staff see all); writes are
// the admin policy. Prices are stored in cents and entered in dollars — the conversion happens
// here, once, and nowhere else.

export type PaymentsDb = Pick<SupabaseClient<Database>, 'from' | 'rpc'>;
export type ProductKind = Database['public']['Enums']['product_kind'];
export type CreditKind = Database['public']['Enums']['credit_kind'];

export const PRODUCT_KINDS = ['class_pack', 'lesson_pack', 'camp', 'team_fee'] as const;
export const PRODUCT_KIND_LABELS: Record<ProductKind, string> = {
	class_pack: 'Class pack',
	lesson_pack: 'Lesson pack',
	camp: 'Camp',
	team_fee: 'Team fee'
};

export type Product = {
	id: string;
	kind: ProductKind;
	name: string;
	description: string | null;
	pricePublicCents: number;
	priceMemberCents: number | null;
	currency: string;
	creditKind: CreditKind | null;
	creditQuantity: number | null;
	creditValidityDays: number | null;
	forgivenSkips: number | null;
	stripePricePublic: string | null;
	stripePriceMember: string | null;
	active: boolean;
};

type Row = Database['public']['Tables']['products']['Row'];
const COLUMNS =
	'id, kind, name, description, price_public_cents, price_member_cents, currency, credit_kind, credit_quantity, credit_validity_days, forgiven_skips, stripe_price_public, stripe_price_member, active';

const fromRow = (r: Row): Product => ({
	id: r.id,
	kind: r.kind,
	name: r.name,
	description: r.description,
	pricePublicCents: r.price_public_cents,
	priceMemberCents: r.price_member_cents,
	currency: r.currency,
	creditKind: r.credit_kind,
	creditQuantity: r.credit_quantity,
	creditValidityDays: r.credit_validity_days,
	forgivenSkips: r.forgiven_skips,
	stripePricePublic: r.stripe_price_public,
	stripePriceMember: r.stripe_price_member,
	active: r.active
});

export async function listProducts(
	db: PaymentsDb,
	opts: { activeOnly?: boolean }
): Promise<Result<Product[]>> {
	let query = db.from('products').select(COLUMNS);
	if (opts.activeOnly) query = query.eq('active', true);
	const { data, error } = await query.order('price_public_cents');
	if (error) return err(fromPostgres(error));
	return ok(((data ?? []) as unknown as Row[]).map(fromRow));
}

export async function getProduct(db: PaymentsDb, id: string): Promise<Result<Product | null>> {
	const { data, error } = await db.from('products').select(COLUMNS).eq('id', id).maybeSingle();
	if (error) return err(fromPostgres(error));
	return ok(data ? fromRow(data as unknown as Row) : null);
}

/** Dollars in the form, cents in the database — rounded, so 19.99 is 1999 and never 1998.99…. */
export const toCents = (dollars: number): number => Math.round(dollars * 100);

export function formatMoney(cents: number, currency = 'usd'): string {
	return new Intl.NumberFormat('en-US', {
		style: 'currency',
		currency: currency.toUpperCase()
	}).format(cents / 100);
}

const dollars = z
	.number()
	.min(0, 'A price cannot be negative')
	.refine((d) => Math.abs(d * 100 - Math.round(d * 100)) < 1e-6, 'Whole cents only');
const stripePrice = z
	.string()
	.trim()
	.regex(/^price_[A-Za-z0-9]+$/, 'A Stripe price id starts with price_')
	.optional()
	.or(z.literal(''));

// Mirrors 0001's check constraints so the form can explain; the database still decides.
export const productSchema = z
	.object({
		id: uuid.optional(),
		name: z.string().trim().min(1, 'Name the product').max(80, 'Too long'),
		kind: z.enum(PRODUCT_KINDS),
		description: z.string().trim().max(400, 'Too long').optional(),
		priceDollars: dollars,
		memberPriceDollars: dollars.optional(),
		creditKind: z.enum(CREDIT_KINDS).optional(),
		creditQuantity: z.coerce.number().int().min(1).max(100).optional(),
		validityDays: z.coerce.number().int().min(1).max(730).optional(),
		forgivenSkips: z.coerce.number().int().min(0).max(10).optional(),
		stripePricePublic: stripePrice,
		stripePriceMember: stripePrice,
		active: z.boolean()
	})
	.superRefine((p, ctx) => {
		const isPack = p.kind === 'class_pack' || p.kind === 'lesson_pack';
		const issue = (message: string) =>
			ctx.addIssue({ code: 'custom', path: ['creditKind'], message });
		if (isPack && (!p.creditKind || !p.creditQuantity))
			issue('A pack needs a credit kind and a quantity');
		if (!isPack && (p.creditKind || p.creditQuantity)) issue('Only packs carry credits');
		if (p.kind === 'class_pack' && p.creditKind === 'private_lesson')
			issue('A class pack holds class credits');
		if (p.kind === 'lesson_pack' && p.creditKind && p.creditKind !== 'private_lesson')
			issue('A lesson pack holds private-lesson credits');
	});
export type ProductInput = z.infer<typeof productSchema>;

const rowOf = (p: ProductInput) => ({
	name: p.name,
	kind: p.kind,
	description: p.description || null,
	price_public_cents: toCents(p.priceDollars),
	price_member_cents: p.memberPriceDollars === undefined ? null : toCents(p.memberPriceDollars),
	currency: 'usd',
	credit_kind: p.creditKind ?? null,
	credit_quantity: p.creditQuantity ?? null,
	credit_validity_days: p.validityDays ?? null,
	forgiven_skips: p.forgivenSkips ?? null,
	stripe_price_public: p.stripePricePublic || null,
	stripe_price_member: p.stripePriceMember || null,
	active: p.active
});

/** Insert without an id, update with one. A check-constraint refusal is the form's `validation`. */
export async function saveProduct(
	db: PaymentsDb,
	input: ProductInput
): Promise<Result<{ id: string }>> {
	const table = db.from('products');
	const { data, error } = input.id
		? await table.update(rowOf(input)).eq('id', input.id).select('id').single()
		: await table.insert(rowOf(input)).select('id').single();
	if (error)
		return err(
			error.code === '23514' ? new AppError('validation', error.message) : fromPostgres(error)
		);
	return ok({ id: (data as { id: string }).id });
}

/** `10 CREDITS · VALID 12 WEEKS · 1 FORGIVEN SKIP (+1 WEEK)` — the academy defaults fill the nulls. */
export function packFacts(
	p: {
		creditQuantity: number | null;
		creditValidityDays: number | null;
		forgivenSkips: number | null;
	},
	defaults: { validityDays: number; forgivenSkips: number }
): string {
	const weeks = Math.round((p.creditValidityDays ?? defaults.validityDays) / 7);
	const skips = p.forgivenSkips ?? defaults.forgivenSkips;
	const parts = [`${p.creditQuantity ?? 0} CREDITS`, `VALID ${weeks} WEEKS`];
	if (skips > 0) {
		const s = skips === 1 ? '' : 'S';
		parts.push(`${skips} FORGIVEN SKIP${s} (+${skips} WEEK${s})`);
	}
	return parts.join(' · ');
}
