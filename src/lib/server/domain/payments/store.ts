import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database, Json } from '$lib/server/db/database.types';
import type { EventStore, StripeEventLike } from './webhook';

/** EventStore over the stripe_events table (service role — there is no user in a webhook). */
export function supabaseEventStore(db: SupabaseClient<Database>): EventStore {
	return {
		async claim(event: StripeEventLike) {
			// upsert + ignoreDuplicates returns the row only when this call inserted it
			const { data, error } = await db
				.from('stripe_events')
				.upsert(
					{ id: event.id, type: event.type, payload: event as unknown as Json },
					{ onConflict: 'id', ignoreDuplicates: true }
				)
				.select('id');
			if (error) throw new Error(`stripe_events claim failed: ${error.message}`);
			return data.length ? 'new' : 'duplicate';
		},
		async settle(id, status, errorText) {
			const { error } = await db
				.from('stripe_events')
				.update({ status, processed_at: new Date().toISOString(), error: errorText ?? null })
				.eq('id', id);
			if (error) throw new Error(`stripe_events settle failed: ${error.message}`);
		}
	};
}
