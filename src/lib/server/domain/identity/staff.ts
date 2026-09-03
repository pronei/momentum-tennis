import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '$lib/server/db/database.types';
import { err, fromPostgres, ok, type Result } from '$lib/server/domain/result';

export type StaffDb = Pick<SupabaseClient<Database>, 'from'>;
export type StaffRole = Database['public']['Enums']['staff_role'];
export type StaffRoles = Readonly<{ isStaff: boolean; isAdmin: boolean; isCoach: boolean }>;
export type StaffMember = {
	accountId: string;
	email: string;
	fullName: string;
	roles: StaffRole[];
};

export const NO_ROLES: StaffRoles = { isStaff: false, isAdmin: false, isCoach: false };

/** Roles held by an account. Fails closed: any error grants nothing. */
export async function staffRoles(db: StaffDb, accountId: string): Promise<StaffRoles> {
	const { data, error } = await db.from('staff_members').select('role').eq('account_id', accountId);
	if (error || !data) return NO_ROLES;
	const roles = new Set(data.map((r) => r.role));
	return { isStaff: roles.size > 0, isAdmin: roles.has('admin'), isCoach: roles.has('coach') };
}

type StaffRow = {
	role: StaffRole;
	accounts: { id: string; email: string; full_name: string } | null;
};

/** Everyone the academy has given a role, one row per person. Admin console read. */
export async function listStaff(db: StaffDb): Promise<Result<StaffMember[]>> {
	const { data, error } = await db
		.from('staff_members')
		.select('role, accounts ( id, email, full_name )')
		.order('role');
	if (error) return err(fromPostgres(error));
	const byAccount = new Map<string, StaffMember>();
	for (const row of (data ?? []) as unknown as StaffRow[]) {
		if (!row.accounts) continue;
		const existing = byAccount.get(row.accounts.id);
		if (existing) existing.roles.push(row.role);
		else
			byAccount.set(row.accounts.id, {
				accountId: row.accounts.id,
				email: row.accounts.email,
				fullName: row.accounts.full_name,
				roles: [row.role]
			});
	}
	return ok(
		[...byAccount.values()]
			.map((m) => ({ ...m, roles: [...m.roles].sort() }))
			.sort((a, b) => a.email.localeCompare(b.email))
	);
}

/**
 * Roles attach to an account that already exists — the person signs up first. Staff may read
 * every account (`own_account` admits is_staff()), which is what makes this lookup possible.
 */
export async function findAccountByEmail(
	db: StaffDb,
	email: string
): Promise<Result<{ id: string; email: string; fullName: string } | null>> {
	const { data, error } = await db
		.from('accounts')
		.select('id, email, full_name')
		.eq('email', email.trim().toLowerCase())
		.maybeSingle();
	if (error) return err(fromPostgres(error));
	return ok(data ? { id: data.id, email: data.email, fullName: data.full_name } : null);
}

/** Idempotent: (account_id, role) is the primary key, so granting twice is a no-op. */
export async function grantRole(
	db: StaffDb,
	accountId: string,
	role: StaffRole
): Promise<Result<void>> {
	const { error } = await db.from('staff_members').upsert({ account_id: accountId, role });
	if (error) return err(fromPostgres(error));
	return ok(undefined);
}

/** The database refuses to remove the last admin (0003) — that surfaces as `last_admin`. */
export async function revokeRole(
	db: StaffDb,
	accountId: string,
	role: StaffRole
): Promise<Result<void>> {
	const { error } = await db
		.from('staff_members')
		.delete()
		.eq('account_id', accountId)
		.eq('role', role);
	if (error) return err(fromPostgres(error));
	return ok(undefined);
}
