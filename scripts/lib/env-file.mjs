// Shared by check-env.mjs and build-env.mjs: read a profile and the env file it names.
import fs from 'node:fs';
import path from 'node:path';
import { parse } from 'yaml';

export const root = new URL('../..', import.meta.url).pathname;

/** KEY=VALUE lines; strips quotes and trailing comments outside quotes. */
export function parseEnvFile(text) {
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

export const isPlaceholder = (v) => !v || /^TODO/i.test(String(v));

/** The profile config/<name>.yaml and the parsed contents of its env_file (or null if absent). */
export function readProfile(name) {
	const file = path.join(root, 'config', `${name}.yaml`);
	if (!fs.existsSync(file)) throw new Error(`No profile config/${name}.yaml`);
	const profile = parse(fs.readFileSync(file, 'utf8'));
	const envPath = path.join(root, profile.env_file ?? '');
	const env =
		profile.env_file && fs.existsSync(envPath)
			? parseEnvFile(fs.readFileSync(envPath, 'utf8'))
			: null;
	return { profile, env, envPath };
}

export function listProfiles() {
	return fs
		.readdirSync(path.join(root, 'config'))
		.filter((f) => f.endsWith('.yaml'))
		.map((f) => f.replace(/\.yaml$/, ''))
		.sort();
}
