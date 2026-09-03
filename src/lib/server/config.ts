import { z } from 'zod';

// Pure: parses any Record (process.env, $env, a test fixture) into the typed config.
// The runtime wiring to $env lives in ./config.runtime.ts so this stays unit-testable.
//
// The CORE is strict — without Supabase and a site URL nothing renders, so fail at startup and
// name every missing variable. INTEGRATION secrets are lazy: each arrives with the phase that
// uses it (Stripe in 5, Resend in 7, cron in 7), so an environment must not need a Stripe key to
// render the login page. They are demanded at the point of use via requireSecret().

const nonEmpty = z.string().trim().min(1);
const origin = z.url({ protocol: /^https?$/ });
/** Blank means "not set": a copied .env.example must never count as configured. */
const optionalSecret = z
	.string()
	.trim()
	.transform((v) => v || undefined)
	.optional();

export const SECRET_NAMES = [
	'SUPABASE_SECRET_KEY',
	'STRIPE_SECRET_KEY',
	'STRIPE_WEBHOOK_SECRET',
	'RESEND_API_KEY',
	'CRON_SHARED_SECRET'
] as const;
export type SecretName = (typeof SECRET_NAMES)[number];

const schema = z.object({
	PUBLIC_SUPABASE_URL: origin,
	PUBLIC_SUPABASE_PUBLISHABLE_KEY: nonEmpty,
	PUBLIC_SITE_URL: origin,
	EMAIL_FROM: nonEmpty,
	SUPABASE_SECRET_KEY: optionalSecret,
	STRIPE_SECRET_KEY: optionalSecret,
	STRIPE_WEBHOOK_SECRET: optionalSecret,
	RESEND_API_KEY: optionalSecret,
	CRON_SHARED_SECRET: optionalSecret.refine(
		(v) => v === undefined || v.length >= 16,
		'use at least 16 characters'
	)
});

export type Config = Readonly<{
	supabaseUrl: string;
	supabasePublishableKey: string;
	siteUrl: string;
	emailFrom: string;
	/** Only the secrets that are actually set. Read them through requireSecret(). */
	secrets: Readonly<Partial<Record<SecretName, string>>>;
}>;

export function parseEnv(source: Record<string, string | undefined>): Config {
	const parsed = schema.safeParse(source);
	if (!parsed.success) {
		const names = [...new Set(parsed.error.issues.map((i) => String(i.path[0])))];
		throw new Error(`Invalid environment — check these variables: ${names.join(', ')}`);
	}
	const v = parsed.data;
	const secrets: Partial<Record<SecretName, string>> = {};
	for (const name of SECRET_NAMES) if (v[name]) secrets[name] = v[name];
	return {
		supabaseUrl: v.PUBLIC_SUPABASE_URL,
		supabasePublishableKey: v.PUBLIC_SUPABASE_PUBLISHABLE_KEY,
		siteUrl: v.PUBLIC_SITE_URL,
		emailFrom: v.EMAIL_FROM,
		secrets
	};
}

/** Demand an integration secret where it is used; the message says where to set it. */
export function requireSecret(cfg: Config, name: SecretName): string {
	const value = cfg.secrets[name];
	if (!value) {
		throw new Error(
			`${name} is not set for this environment. Locally: .env.local; deployed: a Cloudflare project secret — see config/*.yaml.`
		);
	}
	return value;
}
