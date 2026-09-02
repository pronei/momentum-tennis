import { describe, expect, it } from 'vitest';
import { authorizeCron, jobsFor, runJobs, type CronDb } from './cron';

describe('authorizeCron — shared secret, constant-time, bearer only', () => {
	it('accepts the exact bearer token', () => {
		expect(authorizeCron('Bearer s3cret-value-1234', 's3cret-value-1234')).toBe(true);
	});
	it('rejects a missing, malformed, or wrong token — and different lengths', () => {
		expect(authorizeCron(null, 's3cret-value-1234')).toBe(false);
		expect(authorizeCron('s3cret-value-1234', 's3cret-value-1234')).toBe(false);
		expect(authorizeCron('Bearer s3cret-value-1235', 's3cret-value-1234')).toBe(false);
		expect(authorizeCron('Bearer s3cret', 's3cret-value-1234')).toBe(false);
	});
});

describe('jobsFor — which SQL jobs a cron expression triggers', () => {
	it('quarter-hourly settles bookings; daily expires credits', () => {
		expect(jobsFor('*/15 * * * *')).toEqual(['finalize_bookings']);
		expect(jobsFor('0 9 * * *')).toEqual(['expire_credits']);
	});
	it('unknown expressions run nothing', () => {
		expect(jobsFor('1 2 3 4 5')).toEqual([]);
	});
});

describe('runJobs — each job is an RPC; one failure does not stop the others', () => {
	it('reports per-job results', async () => {
		const db = {
			rpc: (fn: string) =>
				Promise.resolve(
					fn === 'expire_credits'
						? { data: null, error: { message: 'boom' } }
						: { data: 3, error: null }
				)
		} as unknown as CronDb;
		const out = await runJobs(db, ['finalize_bookings', 'expire_credits']);
		expect(out).toEqual([
			{ job: 'finalize_bookings', ok: true, result: 3 },
			{ job: 'expire_credits', ok: false, error: 'unexpected: boom' }
		]);
	});
});
