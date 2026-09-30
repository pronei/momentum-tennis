// Environment for running the Supabase CLI against THIS repo's Supabase account and no other.
//
// The CLI looks for its token in SUPABASE_ACCESS_TOKEN, then the OS keychain, then
// ~/.supabase/access-token. The last two are the machine-wide login other repos use, and the CLI's
// own --profile does not fence them off: a profile with no token of its own falls through to that
// file (checked with CLI 2.117 on 2026-09-29). So the token always comes from .env.local, no
// SUPABASE_* setting is inherited from the outer shell, and without a repo token there is no
// environment at all — the caller refuses rather than borrow another account's login.
export function supabaseEnv({ base, local }) {
	if (!local.SUPABASE_ACCESS_TOKEN) return null;
	const env = {};
	for (const [key, value] of Object.entries(base))
		if (!key.startsWith('SUPABASE_')) env[key] = value;
	env.SUPABASE_ACCESS_TOKEN = local.SUPABASE_ACCESS_TOKEN;
	return env;
}

// `login` overwrites the machine-wide login and `logout` deletes it, whatever token is passed in
// the environment. Neither has a meaning scoped to this repo, so both are refused.
export function refusal(args) {
	if (!args.includes('login') && !args.includes('logout')) return null;
	return [
		'✗ pnpm sb has no login or logout: the CLI would write the machine-wide Supabase login,',
		"  which belongs to another account. This repo's token lives in .env.local as",
		'  SUPABASE_ACCESS_TOKEN — see docs/OPERATIONS.md §2.'
	].join('\n');
}
