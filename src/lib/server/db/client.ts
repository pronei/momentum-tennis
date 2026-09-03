import { createServerClient } from '@supabase/ssr';
import type { RequestEvent } from '@sveltejs/kit';
import { getConfig } from '$lib/server/config.runtime';
import type { Database } from './database.types';

/**
 * Per-request client bound to the user's auth cookies. Every query runs under RLS as that user —
 * this is the client for routes, load functions and actions. Never use it for webhooks or cron.
 */
export function createRequestSupabase(event: RequestEvent) {
	const { supabaseUrl, supabasePublishableKey } = getConfig();
	return createServerClient<Database>(supabaseUrl, supabasePublishableKey, {
		cookies: {
			getAll: () => event.cookies.getAll(),
			setAll: (cookies) => {
				for (const { name, value, options } of cookies) {
					event.cookies.set(name, value, { ...options, path: '/' });
				}
			}
		}
	});
}
