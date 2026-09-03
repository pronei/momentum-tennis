import path from 'node:path';

// Environment for running wrangler against THIS repo's Cloudflare account and no other:
// - login state lives in <root>/.wrangler/home (gitignored), so `pnpm cf login` never reads or
//   writes the machine-wide wrangler login that other projects use;
// - credentials come only from .env.local (or the profile's account id) — never inherited from
//   the outer shell, where a token for another account may be exported.
export function wranglerEnv({ base, local, root, accountId }) {
	const env = { ...base };
	delete env.CLOUDFLARE_API_TOKEN;
	delete env.CLOUDFLARE_ACCOUNT_ID;
	env.XDG_CONFIG_HOME = path.join(root, '.wrangler', 'home');
	if (local.CLOUDFLARE_API_TOKEN) env.CLOUDFLARE_API_TOKEN = local.CLOUDFLARE_API_TOKEN;
	const id = local.CLOUDFLARE_ACCOUNT_ID ?? accountId;
	if (id) env.CLOUDFLARE_ACCOUNT_ID = id;
	return env;
}
