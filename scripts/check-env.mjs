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
import { isPlaceholder, listProfiles, readProfile, root } from './lib/env-file.mjs';

const only = process.argv[2];
const names = listProfiles().filter((n) => !only || n === only);
if (!names.length) {
	console.error(only ? `No profile config/${only}.yaml` : 'No profiles in config/');
	process.exit(1);
}

let errors = 0;
let pending = 0;

// .env.local must never be committable — it is the only place local secrets live.
try {
	execFileSync('git', ['check-ignore', '-q', '.env.local'], { cwd: root });
} catch {
	console.error('✗ .env.local is not gitignored — local secrets could be committed');
	errors++;
}

for (const name of names) {
	const { profile, env } = readProfile(name);
	console.log(`\n${profile.name ?? name} — ${profile.description ?? ''}`);
	if (!env) {
		console.error(`  ✗ env_file ${profile.env_file} does not exist`);
		errors++;
		continue;
	}

	// A committed env file holds public values only. A secret with a value here is a leak.
	for (const secret of profile.secrets ?? []) {
		const key = typeof secret === 'string' ? secret : secret.name;
		if (env[key]) {
			console.error(`  ✗ ${profile.env_file} sets ${key} — secrets belong in .env.local or CF`);
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

	const unset = ['PUBLIC_SUPABASE_PUBLISHABLE_KEY', 'EMAIL_FROM'].filter((k) =>
		isPlaceholder(env[k])
	);
	if (isPlaceholder(profile.deploy?.site_url)) unset.push('deploy.site_url (profile)');
	if (unset.length) {
		console.log(`  · not configured yet: ${unset.join(', ')}`);
		pending++;
	}
	if (isPlaceholder(profile.cloudflare?.account_id)) {
		console.log('  · cloudflare account_id not confirmed (wrangler whoami)');
		pending++;
	}

	console.log(
		`  · cloudflare ${profile.cloudflare?.worker} ← ${profile.cloudflare?.deploy_branch}`
	);
	console.log(
		`  · build: ${profile.deploy?.build ?? '?'} · deploy: ${profile.deploy?.command ?? '?'}`
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
