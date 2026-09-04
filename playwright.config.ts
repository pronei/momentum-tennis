import { defineConfig } from '@playwright/test';

// Smoke tests against the built app. They need a reachable Supabase (fill .env.development +
// .env.local): the auth hooks construct a client on every request. Not part of `pnpm test`.
export default defineConfig({
	testDir: 'e2e',
	timeout: 30_000,
	use: { baseURL: 'http://localhost:4173' },
	webServer: {
		// build:dev bakes the dev profile's public values; a plain build bakes .env.production's placeholders and cannot start.
		command: 'pnpm build:dev && pnpm preview --port 4173',
		port: 4173,
		// Always build and own the server. Reusing whatever happens to hold 4173 — a preview from
		// an earlier run, one that is shutting down — makes every test fail with a bare
		// ERR_CONNECTION_REFUSED and no hint that the app was never under test. If the port is
		// occupied, failing to start is the honest outcome.
		reuseExistingServer: false
	}
});
