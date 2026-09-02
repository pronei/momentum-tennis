import js from '@eslint/js';
import prettier from 'eslint-config-prettier';
import svelte from 'eslint-plugin-svelte';
import globals from 'globals';
import ts from 'typescript-eslint';
import svelteConfig from './svelte.config.js';

export default ts.config(
	js.configs.recommended,
	...ts.configs.recommended,
	...svelte.configs.recommended,
	prettier,
	...svelte.configs.prettier,
	{
		languageOptions: { globals: { ...globals.browser, ...globals.node } },
		rules: {
			// domain modules must not leak `any` at their boundaries
			'@typescript-eslint/no-explicit-any': 'error',
			'@typescript-eslint/consistent-type-imports': ['error', { fixStyle: 'inline-type-imports' }],
			'no-console': ['warn', { allow: ['warn', 'error'] }]
		}
	},
	{
		files: ['**/*.svelte', '**/*.svelte.ts', '**/*.svelte.js'],
		languageOptions: {
			parserOptions: {
				projectService: true,
				extraFileExtensions: ['.svelte'],
				parser: ts.parser,
				svelteConfig
			}
		}
	},
	{
		// the ported design system receives hrefs the caller has already resolved
		files: ['src/lib/ds/**'],
		rules: { 'svelte/no-navigation-without-resolve': 'off' }
	},
	{
		files: ['scripts/**', 'supabase/tests/**', 'workers/**'],
		rules: { 'no-console': 'off' }
	},
	{
		ignores: [
			'build/',
			'.svelte-kit/',
			'.wrangler/',
			'dist/',
			'node_modules/',
			'design-system/',
			'workers/**/node_modules/',
			'src/lib/server/db/database.types.ts'
		]
	}
);
