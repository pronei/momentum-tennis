// Test-only doubles for the schedule modules. Narrow on purpose: they record the calls a
// function makes and hand back one reply per table, so a test can assert the query shape and
// the refusal mapping without a database. Never imported by application code.
import type { ScheduleDb } from './common';

export type Reply = { data?: unknown; error?: { message: string; code?: string } | null };

const METHODS = [
	'select',
	'eq',
	'in',
	'is',
	'gte',
	'lt',
	'lte',
	'order',
	'limit',
	'insert',
	'upsert',
	'update',
	'delete',
	'single',
	'maybeSingle'
];

/** A chainable, awaitable stand-in for the PostgREST builder — awaited at any depth. */
function queryFake(reply: Reply, calls: unknown[]) {
	const chain: Record<string, unknown> = {};
	for (const m of METHODS)
		chain[m] = (...args: unknown[]) => {
			calls.push([m, ...args]);
			return chain;
		};
	chain.then = (resolve: (v: Reply) => unknown) =>
		Promise.resolve({ data: null, error: null, ...reply }).then(resolve);
	return chain;
}

/** Dispatches per table, so a function that reads two of them can be exercised honestly. */
export function fakeDb(
	opts: { tables?: Record<string, Reply>; rpc?: Reply; calls?: unknown[] } = {}
): ScheduleDb {
	const calls = opts.calls ?? [];
	return {
		from: (table: string) => {
			calls.push(['from', table]);
			return queryFake(opts.tables?.[table] ?? {}, calls);
		},
		rpc: (fn: string, args: Record<string, unknown>) => {
			calls.push(['rpc', fn, args]);
			return Promise.resolve({ data: null, error: null, ...(opts.rpc ?? {}) });
		}
	} as unknown as ScheduleDb;
}

/** Did the function make this call? `calls` is a flat log of [method, ...args] tuples. */
export const called = (calls: unknown[], method: string, ...args: unknown[]) =>
	calls.some(
		(c) =>
			Array.isArray(c) &&
			c[0] === method &&
			args.every((a, i) => JSON.stringify(c[i + 1]) === JSON.stringify(a))
	);
