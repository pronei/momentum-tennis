// Apply supabase/migrations to an environment's database by connecting to it directly.
//
//   pnpm db:push dev              from a machine with IPv6 (the direct host is IPv6-only)
//   pnpm db:push dev --pooler     via the session pooler (IPv4) — automatic when CI is set
//   pnpm db:push dev --dry-run    list what would be applied
//   pnpm db:push dev --yes        skip the confirmation prompt (automatic when CI is set)
//
// No `supabase login` or `supabase link` is needed: the password comes from .env.local
// (SUPABASE_DB_PASSWORD_<PROFILE>, e.g. SUPABASE_DB_PASSWORD_DEV) or the environment, and the
// project ref and pooler host from config/<profile>.yaml. The password is never printed.
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { databaseUrl } from './lib/db-url.mjs';
import { isPlaceholder, parseEnvFile, readProfile, root } from './lib/env-file.mjs';

const args = process.argv.slice(2);
const name = args.find((a) => !a.startsWith('--')) ?? 'dev';
const dryRun = args.includes('--dry-run');
const viaPooler = args.includes('--pooler') || Boolean(process.env.CI);
const yes = args.includes('--yes') || Boolean(process.env.CI); // the CLI's confirmation prompt needs a TTY

const { profile } = readProfile(name);
const { project_ref: ref, pooler } = profile.supabase ?? {};
if (!ref || isPlaceholder(ref)) {
	console.error(`config/${name}.yaml: supabase.project_ref is not set`);
	process.exit(1);
}
if (viaPooler && (!pooler || isPlaceholder(pooler))) {
	console.error(
		`config/${name}.yaml: supabase.pooler is not set (e.g. aws-0-us-west-1 — dashboard → Connect → Session pooler host)`
	);
	process.exit(1);
}

const localPath = path.join(root, '.env.local');
const local = fs.existsSync(localPath) ? parseEnvFile(fs.readFileSync(localPath, 'utf8')) : {};
const key = `SUPABASE_DB_PASSWORD_${name.toUpperCase()}`;
const password = process.env[key] ?? local[key];
if (!password) {
	console.error(
		`${key} is not set. Put it in .env.local (gitignored) — dashboard → Settings → Database.`
	);
	process.exit(1);
}

const url = databaseUrl({ ref, password, pooler: viaPooler ? pooler : undefined });
console.log(
	`db push → ${name} (${ref}) via ${viaPooler ? `pooler ${pooler}` : 'direct host'}${dryRun ? ' [dry run]' : ''}`
);
const result = spawnSync(
	'supabase',
	['db', 'push', '--db-url', url, ...(dryRun ? ['--dry-run'] : []), ...(yes ? ['--yes'] : [])],
	{
		stdio: 'inherit',
		cwd: root
	}
);
if (result.error) {
	console.error(
		`could not run supabase: ${result.error.message} — brew install supabase/tap/supabase`
	);
	process.exit(1);
}
process.exit(result.status ?? 1);
