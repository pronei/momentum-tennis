import { describe, expect, it } from 'vitest';
import { parseEnv } from './config';

const valid = {
	PUBLIC_SUPABASE_URL: 'https://abc.supabase.co',
	PUBLIC_SUPABASE_ANON_KEY: 'anon-key',
	PUBLIC_SITE_URL: 'http://localhost:5173',
	EMAIL_FROM: 'Momentum Tennis <no-reply@momentum-tennis.com>',
	SUPABASE_SERVICE_ROLE_KEY: 'service-key',
	STRIPE_SECRET_KEY: 'sk_test_x',
	STRIPE_WEBHOOK_SECRET: 'whsec_x',
	RESEND_API_KEY: 're_x',
	CRON_SHARED_SECRET: 'a-long-random-secret-value'
};

describe('parseEnv', () => {
	it('returns a typed config from a complete environment', () => {
		const cfg = parseEnv(valid);
		expect(cfg.supabaseUrl).toBe('https://abc.supabase.co');
		expect(cfg.siteUrl).toBe('http://localhost:5173');
		expect(cfg.stripe.secretKey).toBe('sk_test_x');
		expect(cfg.cronSharedSecret).toBe('a-long-random-secret-value');
	});

	it('names every missing variable in one error, never a partial config', () => {
		const { SUPABASE_SERVICE_ROLE_KEY: _a, RESEND_API_KEY: _b, ...partial } = valid;
		void _a;
		void _b;
		expect(() => parseEnv(partial)).toThrowError(/SUPABASE_SERVICE_ROLE_KEY/);
		expect(() => parseEnv(partial)).toThrowError(/RESEND_API_KEY/);
	});

	it('rejects a site URL that is not an absolute http(s) origin', () => {
		expect(() => parseEnv({ ...valid, PUBLIC_SITE_URL: 'momentum-tennis.com' })).toThrowError(
			/PUBLIC_SITE_URL/
		);
	});

	it('treats blank strings as missing (a copied .env.example must not pass)', () => {
		expect(() => parseEnv({ ...valid, STRIPE_WEBHOOK_SECRET: '' })).toThrowError(
			/STRIPE_WEBHOOK_SECRET/
		);
	});
});
