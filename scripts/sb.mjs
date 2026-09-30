// The Supabase CLI, scoped to this repo's Supabase account:   pnpm sb <supabase args…>
//
//   pnpm sb projects list                                   the dev project should be listed
//   pnpm sb gen types --project-id rjiagjfvsaaxezsxfuzq     any command that takes a project ref
//
// The token is SUPABASE_ACCESS_TOKEN in .env.local, created while signed in to this repo's account
// (dashboard → Account → Access Tokens). There is no `pnpm sb login`: the CLI's login and logout
// write the machine-wide token store that other repos use, so both are refused, and so is every
// command when .env.local has no token. Plain `supabase` keeps working for the other account.
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { parseEnvFile, root } from './lib/env-file.mjs';
import { refusal, supabaseEnv } from './lib/supabase-env.mjs';

const args = process.argv.slice(2);
const refused = refusal(args);
if (refused) {
	console.error(refused);
	process.exit(1);
}

const localPath = path.join(root, '.env.local');
const local = fs.existsSync(localPath) ? parseEnvFile(fs.readFileSync(localPath, 'utf8')) : {};
const env = supabaseEnv({ base: process.env, local });
if (!env) {
	console.error(
		[
			'✗ no SUPABASE_ACCESS_TOKEN in .env.local. Without it the CLI falls back to the machine-wide',
			"  login, which belongs to another account. Sign in to this repo's Supabase account, create a",
			'  token at https://supabase.com/dashboard/account/tokens and add it to .env.local.'
		].join('\n')
	);
	process.exit(1);
}

const result = spawnSync('supabase', args, { stdio: 'inherit', cwd: root, env });
if (result.error) {
	console.error(
		`could not run supabase: ${result.error.message} — brew install supabase/tap/supabase`
	);
	process.exit(1);
}
process.exit(result.status ?? 1);
