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
		reuseExistingServer: !process.env.CI
	}
});
