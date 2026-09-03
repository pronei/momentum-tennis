// wrangler, scoped to this repo's Cloudflare account:   pnpm cf <wrangler args…>
//
//   pnpm cf login              log in once for this repo — state lives in .wrangler/home (gitignored)
//   pnpm cf whoami
//   pnpm cf deploy --env dev
//   pnpm cf deploy --env dev --config workers/cron/wrangler.toml
//
// Or skip the login: put CLOUDFLARE_API_TOKEN (and CLOUDFLARE_ACCOUNT_ID) in .env.local.
// The machine-wide wrangler login used by other projects is never read or written.
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { isPlaceholder, parseEnvFile, readProfile, root } from './lib/env-file.mjs';
import { wranglerEnv } from './lib/wrangler-env.mjs';

const localPath = path.join(root, '.env.local');
const local = fs.existsSync(localPath) ? parseEnvFile(fs.readFileSync(localPath, 'utf8')) : {};
const configured = readProfile('dev').profile.cloudflare?.account_id;
const accountId = configured && !isPlaceholder(configured) ? configured : undefined;

const env = wranglerEnv({ base: process.env, local, root, accountId });
const wrangler = path.join(root, 'node_modules', '.bin', 'wrangler');
const result = spawnSync(wrangler, process.argv.slice(2), { stdio: 'inherit', cwd: root, env });
if (result.error) {
	console.error(`could not run wrangler: ${result.error.message} — pnpm install`);
	process.exit(1);
}
process.exit(result.status ?? 1);
