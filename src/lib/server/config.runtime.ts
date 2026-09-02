import { env } from '$env/dynamic/private';
import { PUBLIC_SITE_URL, PUBLIC_SUPABASE_ANON_KEY, PUBLIC_SUPABASE_URL } from '$env/static/public';
import { parseEnv, type Config } from './config';

let cached: Config | undefined;

/** Validated once per isolate; throws a message naming every missing variable. */
export function getConfig(): Config {
	cached ??= parseEnv({ PUBLIC_SITE_URL, PUBLIC_SUPABASE_ANON_KEY, PUBLIC_SUPABASE_URL, ...env });
	return cached;
}
