import { z } from 'zod';

// Pure: parses any Record (process.env, $env, a test fixture) into the typed config.
// The runtime wiring to $env lives in ./config.runtime.ts so this stays unit-testable.

const nonEmpty = z.string().trim().min(1);
const origin = z.url({ protocol: /^https?$/ });

const schema = z.object({
	PUBLIC_SUPABASE_URL: origin,
	PUBLIC_SUPABASE_ANON_KEY: nonEmpty,
	PUBLIC_SITE_URL: origin,
	EMAIL_FROM: nonEmpty,
	SUPABASE_SERVICE_ROLE_KEY: nonEmpty,
	STRIPE_SECRET_KEY: nonEmpty,
	STRIPE_WEBHOOK_SECRET: nonEmpty,
	RESEND_API_KEY: nonEmpty,
	CRON_SHARED_SECRET: z.string().trim().min(16, 'use at least 16 characters')
});

export type Config = Readonly<{
	supabaseUrl: string;
	supabaseAnonKey: string;
	supabaseServiceRoleKey: string;
	siteUrl: string;
	emailFrom: string;
	stripe: Readonly<{ secretKey: string; webhookSecret: string }>;
	resendApiKey: string;
	cronSharedSecret: string;
}>;

export function parseEnv(source: Record<string, string | undefined>): Config {
	const parsed = schema.safeParse(source);
	if (!parsed.success) {
		const names = [...new Set(parsed.error.issues.map((i) => String(i.path[0])))];
		throw new Error(`Invalid environment — check these variables: ${names.join(', ')}`);
	}
	const v = parsed.data;
	return {
		supabaseUrl: v.PUBLIC_SUPABASE_URL,
		supabaseAnonKey: v.PUBLIC_SUPABASE_ANON_KEY,
		supabaseServiceRoleKey: v.SUPABASE_SERVICE_ROLE_KEY,
		siteUrl: v.PUBLIC_SITE_URL,
		emailFrom: v.EMAIL_FROM,
		stripe: { secretKey: v.STRIPE_SECRET_KEY, webhookSecret: v.STRIPE_WEBHOOK_SECRET },
		resendApiKey: v.RESEND_API_KEY,
		cronSharedSecret: v.CRON_SHARED_SECRET
	};
}
