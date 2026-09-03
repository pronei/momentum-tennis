// Build the app for a deployment profile.
//
//   pnpm build:dev     → node scripts/build-env.mjs dev
//   pnpm build:live    → node scripts/build-env.mjs prod
//
// `vite build` reads .env.production by default, so a dev deployment would be baked with
// production's public values (or its TODOs). This loads the profile's env file into the
// build's environment instead — Vite gives real environment variables priority over env
// files — and takes PUBLIC_SITE_URL from the profile's deploy.site_url, so .env.development
// can keep localhost for the dev server while the deployed dev build knows its own origin.
// NODE_ENV stays production: this is a deployment, not the dev server.
// Anything already set in the shell wins, so a one-off override is just a prefix.
import { spawnSync } from 'node:child_process';
import { isPlaceholder, readProfile } from './lib/env-file.mjs';

const name = process.argv[2];
if (!name) {
	console.error('usage: node scripts/build-env.mjs <profile>   (see config/)');
	process.exit(2);
}
const { profile, env } = readProfile(name);
if (!env) {
	console.error(`profile ${name}: env_file ${profile.env_file} not found`);
	process.exit(1);
}

// The committed env file is public-only by construction (check-env refuses otherwise).
const fromFile = { ...env };
const siteUrl = profile.deploy?.site_url;
if (!isPlaceholder(siteUrl)) fromFile.PUBLIC_SITE_URL = siteUrl;

const missing = [
	'PUBLIC_SUPABASE_URL',
	'PUBLIC_SUPABASE_PUBLISHABLE_KEY',
	'PUBLIC_SITE_URL'
].filter((k) => isPlaceholder(process.env[k] ?? fromFile[k]));
if (missing.length) {
	console.error(`profile ${name}: not configured yet — ${missing.join(', ')}`);
	process.exit(1);
}

console.log(
	`build: profile ${profile.name} · ${profile.env_file} · PUBLIC_SITE_URL=${process.env.PUBLIC_SITE_URL ?? fromFile.PUBLIC_SITE_URL}`
);
const result = spawnSync('pnpm', ['exec', 'vite', 'build'], {
	stdio: 'inherit',
	env: { ...fromFile, ...process.env, NODE_ENV: 'production' }
});
process.exit(result.status ?? 1);
