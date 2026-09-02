import { describe, expect, it } from 'vitest';
import { safeRedirectPath } from './redirect';

describe('safeRedirectPath — the `next` parameter must never leave the site', () => {
	it('accepts a same-origin absolute path', () => {
		expect(safeRedirectPath('/portal/account?tab=1')).toBe('/portal/account?tab=1');
	});
	it('falls back for missing, relative, protocol-relative and absolute URLs', () => {
		expect(safeRedirectPath(null)).toBe('/portal');
		expect(safeRedirectPath('portal')).toBe('/portal');
		expect(safeRedirectPath('//evil.example/x')).toBe('/portal');
		expect(safeRedirectPath('https://evil.example/x')).toBe('/portal');
		expect(safeRedirectPath('/\\evil.example')).toBe('/portal');
	});
	it('honours a custom fallback', () => {
		expect(safeRedirectPath('', '/admin')).toBe('/admin');
	});
});
