import { describe, expect, it } from 'vitest';
import {
	findAccountByEmail,
	grantRole,
	listStaff,
	revokeRole,
	staffRoles,
	type StaffDb
} from './staff';

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

// ── phase 1: the admin console's reads and writes ──
type Reply = { data?: unknown; error?: { message: string; code?: string } | null };

function chain(reply: Reply, calls: unknown[]) {
	const c: Record<string, unknown> = {};
	for (const m of ['select', 'eq', 'is', 'order', 'upsert', 'delete', 'maybeSingle']) {
		c[m] = (...args: unknown[]) => {
			calls.push([m, ...args]);
			return c;
		};
	}
	c.then = (resolve: (v: Reply) => unknown) =>
		Promise.resolve({ data: null, error: null, ...reply }).then(resolve);
	return c;
}
function db2(reply: Reply = {}, calls: unknown[] = []): StaffDb {
	return {
		from: (t: string) => {
			calls.push(['from', t]);
			return chain(reply, calls);
		}
	} as unknown as StaffDb;
}

describe('listStaff — who the academy has, and what they hold', () => {
	it('groups the rows by account so one person is one row', async () => {
		const db = db2({
			data: [
				{ role: 'admin', accounts: { id: 'a1', email: 'artur@x', full_name: 'Artur W.' } },
				{ role: 'coach', accounts: { id: 'a1', email: 'artur@x', full_name: 'Artur W.' } },
				{ role: 'coach', accounts: { id: 'a2', email: 'coach@x', full_name: '' } }
			]
		});
		const r = await listStaff(db);
		if (!r.ok) throw new Error('expected ok');
		expect(r.value).toEqual([
			{ accountId: 'a1', email: 'artur@x', fullName: 'Artur W.', roles: ['admin', 'coach'] },
			{ accountId: 'a2', email: 'coach@x', fullName: '', roles: ['coach'] }
		]);
	});
	it('maps a failure instead of pretending the academy has no staff', async () => {
		const r = await listStaff(db2({ error: { code: '42501', message: 'denied' } }));
		if (r.ok) throw new Error('expected err');
		expect(r.error.code).toBe('not_authorized');
	});
});

describe('findAccountByEmail — roles are granted to an existing account, never to an address', () => {
	it('finds the account, lower-casing what was typed', async () => {
		const calls: unknown[] = [];
		const db = db2({ data: { id: 'a1', email: 'artur@x', full_name: 'Artur W.' } }, calls);
		const r = await findAccountByEmail(db, '  Artur@X  ');
		if (!r.ok) throw new Error('expected ok');
		expect(r.value).toEqual({ id: 'a1', email: 'artur@x', fullName: 'Artur W.' });
		expect(calls).toContainEqual(['eq', 'email', 'artur@x']);
	});
	it('returns null when nobody has signed up with that address', async () => {
		const r = await findAccountByEmail(db2({ data: null }), 'nobody@x');
		expect(r).toEqual({ ok: true, value: null });
	});
});

describe('grantRole / revokeRole', () => {
	it('grantRole upserts, so granting twice is not an error', async () => {
		const calls: unknown[] = [];
		const r = await grantRole(db2({}, calls), 'a1', 'coach');
		expect(r.ok).toBe(true);
		expect(calls).toContainEqual(['from', 'staff_members']);
		expect(calls.some((c) => Array.isArray(c) && c[0] === 'upsert')).toBe(true);
	});
	it('revokeRole targets exactly one account and one role', async () => {
		const calls: unknown[] = [];
		await revokeRole(db2({}, calls), 'a1', 'admin');
		expect(calls).toContainEqual(['eq', 'account_id', 'a1']);
		expect(calls).toContainEqual(['eq', 'role', 'admin']);
	});
	it('surfaces the database refusing to remove the last admin', async () => {
		const r = await revokeRole(db2({ error: { message: 'last_admin' } }), 'a1', 'admin');
		if (r.ok) throw new Error('expected err');
		expect(r.error.code).toBe('last_admin');
	});
});
