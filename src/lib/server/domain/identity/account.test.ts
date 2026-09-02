import { describe, expect, it } from 'vitest';
import { profileSchema, updateProfile, type AccountDb } from './account';

function fakeDb(
	handler: (
		table: string,
		patch: Record<string, unknown>,
		id: string
	) => { error?: { message: string; code?: string } | null }
): AccountDb {
	return {
		from: (table: string) => ({
			update: (patch: Record<string, unknown>) => ({
				eq: (_col: string, id: string) =>
					Promise.resolve({ error: null, ...handler(table, patch, id) })
			})
		})
	} as unknown as AccountDb;
}

describe('profileSchema', () => {
	it('trims and requires a name; phone is optional but bounded', () => {
		expect(profileSchema.parse({ fullName: '  Priya R. ', phone: '' })).toEqual({
			fullName: 'Priya R.',
			phone: ''
		});
		expect(profileSchema.safeParse({ fullName: ' ', phone: '' }).success).toBe(false);
		expect(profileSchema.safeParse({ fullName: 'P', phone: 'x'.repeat(41) }).success).toBe(false);
	});
});

describe('updateProfile — a family edits its own account row under RLS', () => {
	it('updates only the account that matches the caller', async () => {
		const calls: unknown[] = [];
		const db = fakeDb((table, patch, id) => {
			calls.push([table, patch, id]);
			return {};
		});
		const r = await updateProfile(db, 'acct-1', { fullName: 'Priya R.', phone: '669-264-0000' });
		expect(r.ok).toBe(true);
		expect(calls).toEqual([
			['accounts', { full_name: 'Priya R.', phone: '669-264-0000' }, 'acct-1']
		]);
	});
	it('stores an empty phone as null and maps a refusal', async () => {
		const seen: Record<string, unknown>[] = [];
		const db = fakeDb((_t, patch) => {
			seen.push(patch);
			return { error: { code: '42501', message: 'new row violates row-level security policy' } };
		});
		const r = await updateProfile(db, 'acct-2', { fullName: 'Sam', phone: '' });
		expect(seen[0]).toEqual({ full_name: 'Sam', phone: null });
		if (r.ok) throw new Error('expected err');
		expect(r.error.code).toBe('not_authorized');
	});
});
