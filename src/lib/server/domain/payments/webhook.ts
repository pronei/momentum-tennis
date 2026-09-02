// Stripe webhooks duplicate and arrive out of order. Idempotency is structural: the event id is
// claimed in stripe_events BEFORE any handler runs; a redelivery finds the claim and stops.
// The store is a port (EventStore) so this logic is tested without a database.

export type StripeEventLike = { id: string; type: string; data: { object: unknown } };
export type StripeHandler = (event: StripeEventLike) => Promise<void>;
export type StripeHandlers = Record<string, StripeHandler>;
export type EventOutcome = 'processed' | 'duplicate' | 'skipped';

export interface EventStore {
	/** Insert-first: 'new' if this call recorded the id, 'duplicate' if it already existed. */
	claim(event: StripeEventLike): Promise<'new' | 'duplicate'>;
	settle(id: string, status: 'processed' | 'skipped' | 'error', error?: string): Promise<void>;
}

export async function handleStripeEvent(
	store: EventStore,
	event: StripeEventLike,
	handlers: StripeHandlers
): Promise<EventOutcome> {
	if ((await store.claim(event)) === 'duplicate') return 'duplicate';
	const handler = handlers[event.type];
	if (!handler) {
		await store.settle(event.id, 'skipped');
		return 'skipped';
	}
	try {
		await handler(event);
	} catch (e) {
		// Recorded as error and rethrown: Stripe retries, and the claim is not consumed silently.
		await store.settle(event.id, 'error', e instanceof Error ? e.message : String(e));
		throw e;
	}
	await store.settle(event.id, 'processed');
	return 'processed';
}
