import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { getConfig } from '$lib/server/config.runtime';
import type { Database } from './database.types';

let client: SupabaseClient<Database> | undefined;

/**
 * Service-role client: bypasses RLS. Only for code paths with no user — Stripe webhooks, the
 * cron endpoint, admin server operations that must act across accounts. Never reachable from
 * a load function that renders for a user.
 */
export function createAdminSupabase(): SupabaseClient<Database> {
	const { supabaseUrl, supabaseServiceRoleKey } = getConfig();
	client ??= createClient<Database>(supabaseUrl, supabaseServiceRoleKey, {
		auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false }
	});
	return client;
}
