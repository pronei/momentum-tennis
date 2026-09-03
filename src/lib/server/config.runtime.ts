import { error } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import {
	PUBLIC_SITE_URL,
	PUBLIC_SUPABASE_PUBLISHABLE_KEY,
	PUBLIC_SUPABASE_URL
} from '$env/static/public';
import { parseEnv, requireSecret, type Config, type SecretName } from './config';

let cached: Config | undefined;

/** Validated once per isolate; throws a message naming every missing core variable. */
export function getConfig(): Config {
	cached ??= parseEnv({
		PUBLIC_SITE_URL,
		PUBLIC_SUPABASE_PUBLISHABLE_KEY,
		PUBLIC_SUPABASE_URL,
		...env
	});
	return cached;
}

/**
 * For endpoints that only exist once their integration is configured (Stripe webhook, cron):
 * a missing secret is a 503 "not configured here", not a 500 and not a silent success.
 */
export function secretOr503(name: SecretName, what: string): string {
	try {
		return requireSecret(getConfig(), name);
	} catch {
		error(503, `${what} is not configured for this environment`);
	}
}
