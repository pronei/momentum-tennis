import { describe, expect, it } from 'vitest';
import { called, fakeDb } from '../schedule/fakes';
import {
	formatMoney,
	getProduct,
	listProducts,
	packFacts,
	productSchema,
	saveProduct,
	toCents,
	type ProductInput
} from './products';

const row = {
	id: 'p1',
	kind: 'class_pack',
	name: 'Weekday classes',
	description: '10 credits',
	price_public_cents: 50000,
	price_member_cents: null,
	currency: 'usd',
	credit_kind: 'class_weekday',
	credit_quantity: 10,
	credit_validity_days: 84,
	forgiven_skips: 1,
	stripe_price_public: null,
	stripe_price_member: null,
	active: true
};
const pack: ProductInput = {
	name: 'Weekday classes',
	kind: 'class_pack',
	priceDollars: 500,
	creditKind: 'class_weekday',
	creditQuantity: 10,
	active: true
};

describe('listProducts / getProduct — the catalogue, read through RLS', () => {
	it('reads active products ordered by price when asked, every product otherwise', async () => {
		const calls: unknown[] = [];
		const out = await listProducts(fakeDb({ tables: { products: { data: [row] } }, calls }), {
			activeOnly: true
		});
		expect(out.ok && out.value[0]).toMatchObject({
			id: 'p1',
			kind: 'class_pack',
			name: 'Weekday classes',
			pricePublicCents: 50000,
			priceMemberCents: null,
			currency: 'usd',
			creditKind: 'class_weekday',
			creditQuantity: 10,
			creditValidityDays: 84,
			forgivenSkips: 1,
			stripePricePublic: null,
			active: true
		});
		expect(called(calls, 'from', 'products')).toBe(true);
		expect(called(calls, 'eq', 'active', true)).toBe(true);
		expect(called(calls, 'order', 'price_public_cents')).toBe(true);

		const all: unknown[] = [];
		await listProducts(fakeDb({ tables: { products: { data: [] } }, calls: all }), {});
		expect(called(all, 'eq', 'active', true)).toBe(false);
	});

	it('getProduct is null for an unknown id and maps a refusal', async () => {
		expect(await getProduct(fakeDb({ tables: { products: { data: null } } }), 'nope')).toEqual({
			ok: true,
			value: null
		});
		const out = await getProduct(
			fakeDb({ tables: { products: { error: { code: '42501', message: 'rls' } } } }),
			'p1'
		);
		expect(!out.ok && out.error.code).toBe('not_authorized');
	});
});

describe('productSchema — the admin form mirrors the check constraint, for UX only', () => {
	it('accepts a pack', () => {
		expect(productSchema.safeParse(pack).success).toBe(true);
	});
	it('a pack needs a credit kind and quantity; a camp must not carry them', () => {
		expect(productSchema.safeParse({ ...pack, creditKind: undefined }).success).toBe(false);
		expect(
			productSchema.safeParse({ name: 'Camp', kind: 'camp', priceDollars: 300, active: true })
				.success
		).toBe(true);
		expect(
			productSchema.safeParse({
				name: 'Camp',
				kind: 'camp',
				priceDollars: 300,
				creditKind: 'class_weekday',
				creditQuantity: 5,
				active: true
			}).success
		).toBe(false);
	});
	it('a lesson pack is private-lesson credits; a class pack is class credits', () => {
		expect(
			productSchema.safeParse({ ...pack, kind: 'lesson_pack', creditKind: 'private_lesson' })
				.success
		).toBe(true);
		expect(productSchema.safeParse({ ...pack, kind: 'lesson_pack' }).success).toBe(false);
		expect(productSchema.safeParse({ ...pack, creditKind: 'private_lesson' }).success).toBe(false);
	});
	it('prices are dollars with at most two decimals, never negative; a member price is optional', () => {
		expect(productSchema.safeParse({ ...pack, priceDollars: -1 }).success).toBe(false);
		expect(productSchema.safeParse({ ...pack, priceDollars: 19.999 }).success).toBe(false);
		expect(productSchema.safeParse({ ...pack, memberPriceDollars: 450 }).success).toBe(true);
	});
	it('stripe price ids look like price_…', () => {
		expect(productSchema.safeParse({ ...pack, stripePricePublic: 'price_1Abc' }).success).toBe(
			true
		);
		expect(productSchema.safeParse({ ...pack, stripePricePublic: 'prod_1Abc' }).success).toBe(
			false
		);
	});
});

describe('saveProduct — insert without an id, update with one; dollars become cents here', () => {
	it('inserts, converting dollars to cents without float drift', async () => {
		const calls: unknown[] = [];
		const out = await saveProduct(fakeDb({ tables: { products: { data: { id: 'p9' } } }, calls }), {
			name: 'Lessons',
			kind: 'lesson_pack',
			priceDollars: 19.99,
			creditKind: 'private_lesson',
			creditQuantity: 4,
			active: true
		});
		expect(out).toEqual({ ok: true, value: { id: 'p9' } });
		const insert = calls.find((c) => Array.isArray(c) && c[0] === 'insert') as unknown[];
		expect(insert?.[1]).toMatchObject({
			name: 'Lessons',
			kind: 'lesson_pack',
			description: null,
			price_public_cents: 1999,
			price_member_cents: null,
			credit_kind: 'private_lesson',
			credit_quantity: 4,
			credit_validity_days: null,
			forgiven_skips: null,
			stripe_price_public: null,
			stripe_price_member: null,
			active: true
		});
		expect(called(calls, 'update')).toBe(false);
	});

	it('updates by id, and maps the check constraint to validation and RLS to not_authorized', async () => {
		const calls: unknown[] = [];
		await saveProduct(fakeDb({ tables: { products: { data: { id: 'p1' } } }, calls }), {
			id: 'p1',
			...pack,
			active: false
		});
		expect(called(calls, 'update')).toBe(true);
		expect(called(calls, 'eq', 'id', 'p1')).toBe(true);
		expect(called(calls, 'insert')).toBe(false);

		const checked = await saveProduct(
			fakeDb({
				tables: { products: { error: { code: '23514', message: 'violates check constraint' } } }
			}),
			pack
		);
		expect(!checked.ok && checked.error.code).toBe('validation');
		const refused = await saveProduct(
			fakeDb({ tables: { products: { error: { code: '42501', message: 'rls' } } } }),
			pack
		);
		expect(!refused.ok && refused.error.code).toBe('not_authorized');
	});
});

describe('money and pack facts — mono strings the store and the receipt show', () => {
	it('formats cents as dollars and converts dollars to cents exactly', () => {
		expect(formatMoney(50000)).toBe('$500.00');
		expect(formatMoney(1999, 'usd')).toBe('$19.99');
		expect(toCents(19.99)).toBe(1999);
		expect(toCents(500)).toBe(50000);
	});
	it('describes a pack in one line, falling back to the academy defaults', () => {
		const defaults = { validityDays: 70, forgivenSkips: 1 };
		expect(
			packFacts({ creditQuantity: 10, creditValidityDays: 84, forgivenSkips: 1 }, defaults)
		).toBe('10 CREDITS · VALID 12 WEEKS · 1 FORGIVEN SKIP (+1 WEEK)');
		expect(
			packFacts({ creditQuantity: 10, creditValidityDays: null, forgivenSkips: 0 }, defaults)
		).toBe('10 CREDITS · VALID 10 WEEKS');
		expect(
			packFacts({ creditQuantity: 4, creditValidityDays: 84, forgivenSkips: null }, defaults)
		).toBe('4 CREDITS · VALID 12 WEEKS · 1 FORGIVEN SKIP (+1 WEEK)');
		expect(
			packFacts({ creditQuantity: 4, creditValidityDays: 84, forgivenSkips: 2 }, defaults)
		).toBe('4 CREDITS · VALID 12 WEEKS · 2 FORGIVEN SKIPS (+2 WEEKS)');
	});
});
