import { describe, expect, it } from 'vitest';
import { refusal, supabaseEnv } from './supabase-env.mjs';

const base = { PATH: '/usr/bin', HOME: '/Users/x' };
const token = 'repo-token-fixture';

describe('supabaseEnv', () => {
	it('passes the repo token from .env.local and keeps the rest of the environment', () => {
		const env = supabaseEnv({ base, local: { SUPABASE_ACCESS_TOKEN: token } });
		expect(env?.SUPABASE_ACCESS_TOKEN).toBe(token);
		expect(env?.PATH).toBe('/usr/bin');
		expect(env?.HOME).toBe('/Users/x');
	});

	it('never inherits Supabase settings from the outer shell', () => {
		const outer = {
			...base,
			SUPABASE_ACCESS_TOKEN: 'sbp_other_account',
			SUPABASE_PROFILE: '/elsewhere/profile.yaml',
			SUPABASE_DB_PASSWORD: 'another-project'
		};
		const env = supabaseEnv({ base: outer, local: { SUPABASE_ACCESS_TOKEN: token } });
		expect(env?.SUPABASE_ACCESS_TOKEN).toBe(token);
		expect(env?.SUPABASE_PROFILE).toBeUndefined();
		expect(env?.SUPABASE_DB_PASSWORD).toBeUndefined();
	});

	it('gives no environment without a repo token — the CLI would fall back to the machine-wide login', () => {
		expect(
			supabaseEnv({ base: { ...base, SUPABASE_ACCESS_TOKEN: 'sbp_x' }, local: {} })
		).toBeNull();
	});
});

describe('refusal', () => {
	it('refuses login and logout, which write the machine-wide login, wherever they appear', () => {
		for (const args of [['login'], ['logout'], ['--debug', 'logout'], ['login', '--token', 't']])
			expect(refusal(args)).toMatch(/\.env\.local/);
	});

	it('lets every other command through', () => {
		expect(refusal(['projects', 'list'])).toBeNull();
		expect(refusal([])).toBeNull();
	});
});
