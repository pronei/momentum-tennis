import { describe, expect, it } from 'vitest';
import { databaseUrl } from './db-url.mjs';

describe('databaseUrl', () => {
	it('uses the direct host and percent-encodes the password', () => {
		expect(databaseUrl({ ref: 'abcd', password: 'p#@!w' })).toBe(
			'postgresql://postgres:p%23%40!w@db.abcd.supabase.co:5432/postgres'
		);
	});

	it('routes through the session pooler (IPv4) when a pooler host is given', () => {
		expect(databaseUrl({ ref: 'abcd', password: 'x', pooler: 'aws-0-us-west-1' })).toBe(
			'postgresql://postgres.abcd:x@aws-0-us-west-1.pooler.supabase.com:5432/postgres'
		);
	});
});
