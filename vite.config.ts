import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vitest/config';

export default defineConfig({
	plugins: [sveltekit()],
	server: {
		fs: {
			// tokens + reference components are read straight from the design-system export
			allow: ['design-system']
		}
	},
	test: {
		include: ['src/**/*.test.ts', 'supabase/tests/**/*.test.ts', 'scripts/**/*.test.ts'],
		environment: 'node',
		testTimeout: 120_000
	}
});
