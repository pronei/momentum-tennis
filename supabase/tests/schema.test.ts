import { execFileSync } from 'node:child_process';
import { describe, expect, it } from 'vitest';

// The behavioral harness is a plain Node script (so it also runs without vitest: `pnpm db:test`).
// Here it is one test: the schema loads in a real Postgres and every invariant holds.
describe('schema (PGlite)', () => {
	it('applies migrations + seed and passes every behavioral check', () => {
		const out = execFileSync('node', [new URL('./validate.mjs', import.meta.url).pathname], {
			encoding: 'utf8',
			timeout: 110_000
		});
		expect(out).toContain('ALL CHECKS PASSED');
		expect(out).not.toMatch(/✗/);
	});
});
