import adapter from '@sveltejs/adapter-cloudflare';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	compilerOptions: {
		// Runes everywhere in our code; libraries decide for themselves. Removable in Svelte 6.
		runes: ({ filename }) => (filename.split(/[/\\]/).includes('node_modules') ? undefined : true)
	},
	kit: {
		adapter: adapter({
			// One worker serves both deployments; the CF project (dev/live) supplies its own env.
			routes: { include: ['/*'], exclude: ['<all>'] }
		}),
		alias: {
			// The design system stays the single styling truth: tokens are imported from the
			// export, never copied. Components in src/lib/ds are ports of design-system/components.
			$ds: 'design-system'
		},
		csrf: { trustedOrigins: [] },
		env: { publicPrefix: 'PUBLIC_' }
	}
};

export default config;
