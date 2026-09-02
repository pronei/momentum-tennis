/// <reference types="@cloudflare/workers-types" />
import type { Session, SupabaseClient, User } from '@supabase/supabase-js';
import type { Database } from '$lib/server/db/database.types';
import type { StaffRoles } from '$lib/server/domain/identity/staff';

declare global {
	namespace App {
		interface Locals {
			/** Per-request, cookie-backed client: every query runs under the user's RLS. */
			supabase: SupabaseClient<Database>;
			/** Validates the JWT with the auth server before trusting it (never trust getSession alone). */
			safeGetSession: () => Promise<{ session: Session | null; user: User | null }>;
			session: Session | null;
			user: User | null;
			/** Resolved server-side in hooks for /admin and /coach; all false elsewhere. */
			roles: StaffRoles;
		}
		interface PageData {
			session: Session | null;
		}
		interface Platform {
			env: Env;
			cf: CfProperties;
			ctx: ExecutionContext;
		}
		// interface Error {}
		// interface PageState {}
	}
	/** Worker bindings. Secrets are read via $env/dynamic/private, not from here. */
	interface Env {
		ASSETS: Fetcher;
	}
}

export {};
