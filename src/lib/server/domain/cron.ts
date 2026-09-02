import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '$lib/server/db/database.types';
import { fromPostgres } from './result';

export type CronDb = Pick<SupabaseClient<Database>, 'rpc'>;
export type CronJob = 'finalize_bookings' | 'expire_credits';
export type JobResult =
	{ job: CronJob; ok: true; result: unknown } | { job: CronJob; ok: false; error: string };

/** Cron expression (from workers/cron/wrangler.toml) → the idempotent SQL jobs it runs. */
const SCHEDULE: Record<string, CronJob[]> = {
	'*/15 * * * *': ['finalize_bookings'], // settle ended sessions from attendance (no-show → forgiveness)
	'0 9 * * *': ['expire_credits'] // write expiry rows for lots past their validity
};
export const jobsFor = (cron: string): CronJob[] => SCHEDULE[cron] ?? [];

/** Bearer token, compared in constant time; length mismatch is a refusal, not a short-circuit leak. */
export function authorizeCron(header: string | null, secret: string): boolean {
	if (!header || !header.startsWith('Bearer ')) return false;
	const a = new TextEncoder().encode(header.slice('Bearer '.length));
	const b = new TextEncoder().encode(secret);
	let diff = a.length ^ b.length;
	for (let i = 0; i < Math.max(a.length, b.length); i++) diff |= (a[i] ?? 0) ^ (b[i] ?? 0);
	return diff === 0;
}

/** Every job is its own RPC; one failure is reported, the others still run. */
export async function runJobs(db: CronDb, jobs: CronJob[]): Promise<JobResult[]> {
	const out: JobResult[] = [];
	for (const job of jobs) {
		const { data, error } = await db.rpc(job);
		out.push(
			error
				? { job, ok: false, error: fromPostgres(error).message }
				: { job, ok: true, result: data }
		);
	}
	return out;
}
