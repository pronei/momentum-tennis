import { describe, expect, it } from 'vitest';
import { parseEnv, requireSecret } from './config';

const core = {
	PUBLIC_SUPABASE_URL: 'https://abc.supabase.co',
	PUBLIC_SUPABASE_PUBLISHABLE_KEY: 'sb_publishable_test',
	PUBLIC_SITE_URL: 'http://localhost:5173',
	EMAIL_FROM: 'Momentum Tennis <no-reply@momentum-tennis.com>'
};
const secrets = {
	SUPABASE_SERVICE_ROLE_KEY: 'service-key',
	STRIPE_SECRET_KEY: 'sk_test_x',
	STRIPE_WEBHOOK_SECRET: 'whsec_x',
	RESEND_API_KEY: 're_x',
	CRON_SHARED_SECRET: 'a-long-random-secret-value'
};

describe('parseEnv — the core is strict, the integrations are lazy', () => {
	it('returns a typed config from a complete environment', () => {
		const cfg = parseEnv({ ...core, ...secrets });
		expect(cfg.supabaseUrl).toBe('https://abc.supabase.co');
		expect(cfg.siteUrl).toBe('http://localhost:5173');
		expect(cfg.secrets.STRIPE_SECRET_KEY).toBe('sk_test_x');
		expect(requireSecret(cfg, 'CRON_SHARED_SECRET')).toBe('a-long-random-secret-value');
	});

	it('the app renders with only its core values — integration secrets arrive with their phases', () => {
		const cfg = parseEnv(core);
		expect(cfg.supabasePublishableKey).toBe('sb_publishable_test');
		expect(cfg.secrets).toEqual({});
	});

	it('names every missing core variable in one error, never a partial config', () => {
		const { PUBLIC_SUPABASE_URL: _a, EMAIL_FROM: _b, ...partial } = core;
		void _a;
		void _b;
		expect(() => parseEnv(partial)).toThrowError(/PUBLIC_SUPABASE_URL/);
		expect(() => parseEnv(partial)).toThrowError(/EMAIL_FROM/);
	});

	it('requireSecret fails at the point of use, naming the variable and where it is set', () => {
		const cfg = parseEnv(core);
		expect(() => requireSecret(cfg, 'STRIPE_WEBHOOK_SECRET')).toThrowError(
			/STRIPE_WEBHOOK_SECRET.*config\//
		);
	});

	it('treats a blank secret as absent (a copied .env.example must not count as set)', () => {
		const cfg = parseEnv({ ...core, STRIPE_SECRET_KEY: '  ' });
		expect(cfg.secrets.STRIPE_SECRET_KEY).toBeUndefined();
	});

	it('still refuses a weak cron secret when one is supplied', () => {
		expect(() => parseEnv({ ...core, CRON_SHARED_SECRET: 'short' })).toThrowError(
			/CRON_SHARED_SECRET/
		);
	});

	it('rejects a site URL that is not an absolute http(s) origin', () => {
		expect(() => parseEnv({ ...core, PUBLIC_SITE_URL: 'momentum-tennis.com' })).toThrowError(
			/PUBLIC_SITE_URL/
		);
	});
});
