import { describe, expect, it } from 'vitest';
import { staffRoles, type StaffDb } from './staff';

function fakeDb(rows: { role: string }[], error: { message: string } | null = null): StaffDb {
	return {
		from: () => ({
			select: () => ({ eq: () => Promise.resolve({ data: error ? null : rows, error }) })
		})
	} as unknown as StaffDb;
}

describe('staffRoles — the server-side authority for /admin and coach tools', () => {
	it('returns the roles held by the account', async () => {
		const roles = await staffRoles(fakeDb([{ role: 'coach' }, { role: 'admin' }]), 'acct-1');
		expect(roles).toEqual({ isStaff: true, isAdmin: true, isCoach: true });
	});
	it('a family account holds no roles', async () => {
		expect(await staffRoles(fakeDb([]), 'acct-2')).toEqual({
			isStaff: false,
			isAdmin: false,
			isCoach: false
		});
	});
	it('fails closed: a query error grants nothing', async () => {
		expect(await staffRoles(fakeDb([], { message: 'boom' }), 'acct-3')).toEqual({
			isStaff: false,
			isAdmin: false,
			isCoach: false
		});
	});
});
