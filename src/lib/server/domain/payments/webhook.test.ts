import { describe, expect, it } from 'vitest';
import { handleStripeEvent, type EventStore, type StripeEventLike } from './webhook';

/** In-memory EventStore with the same contract the Supabase-backed one honours. */
function memoryStore() {
	const seen = new Map<string, { status: string; error?: string }>();
	const store: EventStore = {
		claim: async (e) => {
			if (seen.has(e.id)) return 'duplicate';
			seen.set(e.id, { status: 'received' });
			return 'new';
		},
		settle: async (id, status, error) => {
			seen.set(id, { status, error });
		}
	};
	return { store, seen };
}
const evt = (id: string, type = 'payment_intent.succeeded'): StripeEventLike => ({
	id,
	type,
	data: { object: { id: 'pi_1' } }
});

describe('handleStripeEvent — idempotent on event id; webhooks duplicate and arrive out of order', () => {
	it('claims, dispatches to the handler for the type, and settles as processed', async () => {
		const { store, seen } = memoryStore();
		const handled: string[] = [];
		const out = await handleStripeEvent(store, evt('evt_1'), {
			'payment_intent.succeeded': async (e) => {
				handled.push(e.id);
			}
		});
		expect(out).toBe('processed');
		expect(handled).toEqual(['evt_1']);
		expect(seen.get('evt_1')?.status).toBe('processed');
	});

	it('a redelivered event is a no-op: the handler never runs twice', async () => {
		const { store } = memoryStore();
		let runs = 0;
		const handlers = { 'payment_intent.succeeded': async () => void runs++ };
		await handleStripeEvent(store, evt('evt_2'), handlers);
		const second = await handleStripeEvent(store, evt('evt_2'), handlers);
		expect(second).toBe('duplicate');
		expect(runs).toBe(1);
	});

	it('types without a handler are recorded and skipped', async () => {
		const { store, seen } = memoryStore();
		expect(await handleStripeEvent(store, evt('evt_3', 'charge.updated'), {})).toBe('skipped');
		expect(seen.get('evt_3')?.status).toBe('skipped');
	});

	it('a handler failure is settled as error with the message, and rethrown so Stripe retries', async () => {
		const { store, seen } = memoryStore();
		await expect(
			handleStripeEvent(store, evt('evt_4'), {
				'payment_intent.succeeded': async () => {
					throw new Error('ledger unavailable');
				}
			})
		).rejects.toThrow('ledger unavailable');
		expect(seen.get('evt_4')).toEqual({ status: 'error', error: 'ledger unavailable' });
	});
});
