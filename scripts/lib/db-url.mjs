// Postgres connection URL for a Supabase project. The direct host is IPv6-only; the session
// pooler (port 5432, user postgres.<ref>) is the IPv4 path — required from GitHub-hosted runners.
// The password is percent-encoded here so nobody hand-encodes `#`, `@` or `!` into a URL.
export function databaseUrl({ ref, password, pooler }) {
	const pw = encodeURIComponent(password);
	return pooler
		? `postgresql://postgres.${ref}:${pw}@${pooler}.pooler.supabase.com:5432/postgres`
		: `postgresql://postgres:${pw}@db.${ref}.supabase.co:5432/postgres`;
}
