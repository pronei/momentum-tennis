// Binds the environment profiles (config/*.yaml) to the committed env files, so the two
// cannot drift apart. Run it before you deploy, and in CI:
//
//   pnpm env:check            both profiles
//   pnpm env:check dev        one profile
//
// Errors (exit 1) are things that are actually wrong:
//   • a secret NAME from the profile carries a value in a committed env file — a leak
//   • the env file is missing, or its Supabase URL is not the project the profile names
//   • .env.local is not gitignored
// Values still to be filled in ("TODO…") are reported as not-configured, not as failures:
// production is legitimately unconfigured until the project exists.
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { parse } from 'yaml';

const root = new URL('..', import.meta.url).pathname;
const only = process.argv[2];
const profiles = fs
	.readdirSync(path.join(root, 'config'))
	.filter((f) => f.endsWith('.yaml'))
	.filter((f) => !only || f === `${only}.yaml`)
	.sort();

if (!profiles.length) {
	console.error(only ? `No profile config/${only}.yaml` : 'No profiles in config/');
	process.exit(1);
}

/** KEY=VALUE lines; strips quotes and trailing comments outside quotes. */
function parseEnvFile(text) {
	const out = {};
	for (const raw of text.split('\n')) {
		const line = raw.trim();
		if (!line || line.startsWith('#')) continue;
		const eq = line.indexOf('=');
		if (eq === -1) continue;
		const key = line.slice(0, eq).trim();
		let value = line.slice(eq + 1).trim();
		if (value.startsWith('"') || value.startsWith("'")) {
			const quote = value[0];
			const end = value.indexOf(quote, 1);
			value = end === -1 ? value.slice(1) : value.slice(1, end);
		} else {
			const hash = value.indexOf('#');
			if (hash !== -1) value = value.slice(0, hash).trim();
		}
		out[key] = value;
	}
	return out;
}

const isPlaceholder = (v) => !v || /^TODO/i.test(v);
let errors = 0;
let pending = 0;

// .env.local must never be committable — it is the only place local secrets live.
try {
	execFileSync('git', ['check-ignore', '-q', '.env.local'], { cwd: root });
} catch {
	console.error('✗ .env.local is not gitignored — local secrets could be committed');
	errors++;
}

for (const file of profiles) {
	const profile = parse(fs.readFileSync(path.join(root, 'config', file), 'utf8'));
	const label = profile.name ?? file;
	console.log(`\n${label} — ${profile.description ?? ''}`);

	const envPath = path.join(root, profile.env_file);
	if (!fs.existsSync(envPath)) {
		console.error(`  ✗ env_file ${profile.env_file} does not exist`);
		errors++;
		continue;
	}
	const env = parseEnvFile(fs.readFileSync(envPath, 'utf8'));

	// A committed env file holds public values only. A secret with a value here is a leak.
	for (const name of profile.secrets ?? []) {
		if (env[name]) {
			console.error(`  ✗ ${profile.env_file} sets ${name} — secrets belong in .env.local or CF`);
			errors++;
		}
	}

	// The env file must point at the project this profile names.
	const ref = profile.supabase?.project_ref;
	const url = env.PUBLIC_SUPABASE_URL;
	if (isPlaceholder(ref) || isPlaceholder(url)) {
		console.log(`  · supabase: not configured yet (${profile.supabase?.plan ?? 'plan unset'})`);
		pending++;
	} else if (!url.includes(ref)) {
		console.error(`  ✗ ${profile.env_file} points at ${url}, not project ${ref}`);
		errors++;
	} else {
		console.log(`  ✓ supabase ${ref} · ${profile.supabase.plan}`);
	}

	const unset = ['PUBLIC_SITE_URL', 'PUBLIC_SUPABASE_PUBLISHABLE_KEY', 'EMAIL_FROM'].filter((k) =>
		isPlaceholder(env[k])
	);
	if (unset.length) {
		console.log(`  · not configured yet: ${unset.join(', ')}`);
		pending++;
	}

	console.log(
		`  · cloudflare ${profile.cloudflare?.worker} ← ${profile.cloudflare?.deploy_branch}`
	);
	console.log(
		`  · stripe ${profile.stripe?.mode} · ${(profile.secrets ?? []).length} secrets by name`
	);
}

console.log('');
if (errors) {
	console.error(`${errors} environment problem(s).`);
	process.exit(1);
}
console.log(pending ? `Profiles agree. ${pending} item(s) not configured yet.` : 'Profiles agree.');
