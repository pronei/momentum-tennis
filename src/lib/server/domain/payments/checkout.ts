import { z } from 'zod';
import { AppError, err, ok, type Result } from '../result';
import { uuid } from '../schedule/common';
import type { PaymentGateway } from './gateway';
import { cancelOrder, createOrder, getOrder } from './orders';
import { getProduct, type PaymentsDb } from './products';

// The one use case of the store: order first (the database prices it), then the gateway. The
// amount sent to the gateway is the ORDER's, never re-derived from the product — if the two ever
// disagreed, the order row is the audited truth.

export const buySchema = z.object({ productId: uuid, playerId: uuid });
export type BuyInput = z.infer<typeof buySchema>;

export type CheckoutDeps = {
	db: PaymentsDb;
	gateway: PaymentGateway;
	siteUrl: string;
	/** the buying account's email, read from the session — never from the form */
	email: string;
};

export async function startCheckout(
	deps: CheckoutDeps,
	input: BuyInput
): Promise<Result<{ orderId: string; url: string }>> {
	const created = await createOrder(deps.db, input);
	if (!created.ok) return created;
	const { orderId } = created.value;

	const [order, product] = await Promise.all([
		getOrder(deps.db, orderId),
		getProduct(deps.db, input.productId)
	]);
	if (!order.ok) return order;
	if (!product.ok) return product;
	const item = order.value?.items[0];
	if (!order.value || !item || !product.value)
		return err(new AppError('unknown_order', 'the order vanished between creation and checkout'));

	// the member price applied when the order carries it and it differs from the public price
	const memberApplied =
		product.value.priceMemberCents !== null &&
		product.value.priceMemberCents !== product.value.pricePublicCents &&
		item.unitAmountCents === product.value.priceMemberCents;

	const session = await deps.gateway.createCheckout({
		orderId,
		customerEmail: deps.email,
		currency: order.value.currency,
		lineItems: [
			{
				name: product.value.name,
				unitAmountCents: item.unitAmountCents,
				quantity: 1,
				stripePriceId: memberApplied
					? product.value.stripePriceMember
					: product.value.stripePricePublic
			}
		],
		successUrl: `${deps.siteUrl}/portal/purchases?paid=${orderId}`,
		cancelUrl: `${deps.siteUrl}/store?cancelled=${orderId}`
	});
	if (!session.ok) {
		// a pending order that will never be paid must not linger; the gateway's refusal is the answer
		await cancelOrder(deps.db, orderId);
		return session;
	}
	return ok({ orderId, url: session.value.url });
}
