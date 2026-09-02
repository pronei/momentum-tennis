import type { SupabaseClient } from '@supabase/supabase-js';
import { z } from 'zod';
import type { Database } from '$lib/server/db/database.types';
import { err, fromPostgres, ok, type Result } from '$lib/server/domain/result';

export type AccountDb = Pick<SupabaseClient<Database>, 'from'>;

/** Boundary schema for the account profile form (colocated with the function that consumes it). */
export const profileSchema = z.object({
	fullName: z.string().trim().min(1, 'Enter a name').max(120),
	phone: z.string().trim().max(40, 'Too long for a phone number').default('')
});
export type ProfileInput = z.infer<typeof profileSchema>;

/** A family edits its own row; RLS (own_account_edit) is what makes `accountId` trustworthy. */
export async function updateProfile(
	db: AccountDb,
	accountId: string,
	input: ProfileInput
): Promise<Result<void>> {
	const { error } = await db
		.from('accounts')
		.update({ full_name: input.fullName, phone: input.phone || null })
		.eq('id', accountId);
	if (error) return err(fromPostgres(error));
	return ok(undefined);
}
