import { describe, expect, it } from 'vitest';
import { wranglerEnv } from './wrangler-env.mjs';

const base = { PATH: '/usr/bin', HOME: '/Users/x' };

describe('wranglerEnv', () => {
	it('keeps wrangler login state inside the repo so other accounts stay untouched', () => {
		const env = wranglerEnv({ base, local: {}, root: '/repo' });
		expect(env.XDG_CONFIG_HOME).toBe('/repo/.wrangler/home');
		expect(env.PATH).toBe('/usr/bin');
	});

	it('passes a repo-scoped API token and account id through from .env.local', () => {
		const local = { CLOUDFLARE_API_TOKEN: 't', CLOUDFLARE_ACCOUNT_ID: 'a' };
		const env = wranglerEnv({ base, local, root: '/repo' });
		expect(env.CLOUDFLARE_API_TOKEN).toBe('t');
		expect(env.CLOUDFLARE_ACCOUNT_ID).toBe('a');
	});

	it('never inherits Cloudflare credentials from the outer shell', () => {
		const outer = {
			...base,
			CLOUDFLARE_API_TOKEN: 'other-account',
			CLOUDFLARE_ACCOUNT_ID: 'other'
		};
		const env = wranglerEnv({ base: outer, local: {}, root: '/repo' });
		expect(env.CLOUDFLARE_API_TOKEN).toBeUndefined();
		expect(env.CLOUDFLARE_ACCOUNT_ID).toBeUndefined();
	});

	it('falls back to the profile account id when .env.local has none', () => {
		const env = wranglerEnv({ base, local: {}, root: '/repo', accountId: 'from-profile' });
		expect(env.CLOUDFLARE_ACCOUNT_ID).toBe('from-profile');
	});
});
