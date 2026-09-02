import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '$lib/server/db/database.types';

export type StaffDb = Pick<SupabaseClient<Database>, 'from'>;
export type StaffRoles = Readonly<{ isStaff: boolean; isAdmin: boolean; isCoach: boolean }>;

export const NO_ROLES: StaffRoles = { isStaff: false, isAdmin: false, isCoach: false };

/** Roles held by an account. Fails closed: any error grants nothing. */
export async function staffRoles(db: StaffDb, accountId: string): Promise<StaffRoles> {
	const { data, error } = await db.from('staff_members').select('role').eq('account_id', accountId);
	if (error || !data) return NO_ROLES;
	const roles = new Set(data.map((r) => r.role));
	return { isStaff: roles.size > 0, isAdmin: roles.has('admin'), isCoach: roles.has('coach') };
}
