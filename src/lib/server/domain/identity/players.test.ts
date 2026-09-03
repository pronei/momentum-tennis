import { describe, expect, it } from 'vitest';
import {
	archivePlayer,
	createPlayer,
	editPlayerSchema,
	listPlayers,
	listSkillLevels,
	newPlayerSchema,
	searchPlayers,
	setPlayerLevel,
	updatePlayer,
	type PlayersDb
} from './players';

type Reply = { data?: unknown; error?: { message: string; code?: string } | null };

/** A chainable, awaitable stand-in for the PostgREST builder — awaited at any depth. */
function queryFake(reply: Reply, calls: unknown[] = []) {
	const chain: Record<string, unknown> = {};
	for (const m of ['select', 'eq', 'is', 'ilike', 'order', 'limit', 'maybeSingle']) {
		chain[m] = (...args: unknown[]) => {
			calls.push([m, ...args]);
			return chain;
		};
	}
	chain.then = (resolve: (v: Reply) => unknown) =>
		Promise.resolve({ data: null, error: null, ...reply }).then(resolve);
	return chain;
}

function fakeDb(opts: { table?: Reply; rpc?: Reply; calls?: unknown[] } = {}): PlayersDb {
	const calls = opts.calls ?? [];
	return {
		from: (table: string) => {
			calls.push(['from', table]);
			return queryFake(opts.table ?? {}, calls);
		},
		rpc: (fn: string, args: Record<string, unknown>) => {
			calls.push(['rpc', fn, args]);
			return Promise.resolve({ data: null, error: null, ...(opts.rpc ?? {}) });
		}
	} as unknown as PlayersDb;
}

describe('newPlayerSchema — the boundary a guardian types into', () => {
	it('accepts a child with a ball level', () => {
		const parsed = newPlayerSchema.parse({
			fullName: '  Maya R. ',
			birthdate: '2015-03-01',
			relationship: 'parent',
			skillLevelKey: 'green_intermediate'
		});
		expect(parsed.fullName).toBe('Maya R.');
	});
	it('accepts a player whose level is not set yet', () => {
		expect(
			newPlayerSchema.safeParse({
				fullName: 'Kai T.',
				birthdate: '2016-09-09',
				relationship: 'parent',
				skillLevelKey: ''
			}).success
		).toBe(true);
	});
	it('refuses a blank name, a malformed or future birthdate, and an unknown relationship', () => {
		const base = { fullName: 'A', birthdate: '2015-03-01', relationship: 'parent' as const };
		expect(newPlayerSchema.safeParse({ ...base, fullName: '  ' }).success).toBe(false);
		expect(newPlayerSchema.safeParse({ ...base, birthdate: '03/01/2015' }).success).toBe(false);
		expect(newPlayerSchema.safeParse({ ...base, birthdate: '2999-01-01' }).success).toBe(false);
		expect(newPlayerSchema.safeParse({ ...base, birthdate: '1820-01-01' }).success).toBe(false);
		expect(newPlayerSchema.safeParse({ ...base, relationship: 'other' }).success).toBe(false);
	});
	it('editPlayerSchema carries the same name and birthdate rules, and no level', () => {
		expect(
			editPlayerSchema.safeParse({ fullName: 'Maya R.', birthdate: '2015-03-01' }).success
		).toBe(true);
		expect(Object.keys(editPlayerSchema.shape)).toEqual(['fullName', 'birthdate']);
	});
});

describe('createPlayer', () => {
	it('passes the four RPC arguments and returns the new id', async () => {
		const calls: unknown[] = [];
		const db = fakeDb({ rpc: { data: 'p-1' }, calls });
		const r = await createPlayer(db, {
			fullName: 'Maya R.',
			birthdate: '2015-03-01',
			relationship: 'parent',
			skillLevelKey: 'green_intermediate'
		});
		expect(calls).toEqual([
			[
				'rpc',
				'create_player',
				{
					p_full_name: 'Maya R.',
					p_birthdate: '2015-03-01',
					p_role: 'parent',
					p_skill_level_key: 'green_intermediate'
				}
			]
		]);
		expect(r).toEqual({ ok: true, value: { playerId: 'p-1' } });
	});

	it('omits an unset level so the SQL default applies — "" would be an unknown level', async () => {
		const calls: unknown[] = [];
		await createPlayer(fakeDb({ rpc: { data: 'p-2' }, calls }), {
			fullName: 'Kai T.',
			birthdate: '2016-09-09',
			relationship: 'parent',
			skillLevelKey: ''
		});
		const args = (calls[0] as [string, string, Record<string, unknown>])[2];
		expect('p_skill_level_key' in args).toBe(false);
		expect(args.p_full_name).toBe('Kai T.');
	});

	it('maps the minor self-link refusal', async () => {
		const db = fakeDb({ rpc: { error: { message: 'minor_self_link' } } });
		const r = await createPlayer(db, {
			fullName: 'Kid',
			birthdate: '2016-01-01',
			relationship: 'self',
			skillLevelKey: ''
		});
		if (r.ok) throw new Error('expected err');
		expect(r.error.code).toBe('minor_self_link');
	});
});

describe('updatePlayer / archivePlayer / setPlayerLevel', () => {
	it('updatePlayer passes the player, name and birthdate', async () => {
		const calls: unknown[] = [];
		const r = await updatePlayer(fakeDb({ calls }), 'p-1', {
			fullName: 'Maya Ramesh',
			birthdate: '2015-03-02'
		});
		expect(calls).toEqual([
			[
				'rpc',
				'update_player',
				{ p_player: 'p-1', p_full_name: 'Maya Ramesh', p_birthdate: '2015-03-02' }
			]
		]);
		expect(r.ok).toBe(true);
	});

	it('archivePlayer refuses to hide a player with history', async () => {
		const db = fakeDb({ rpc: { error: { message: 'player_has_history' } } });
		const r = await archivePlayer(db, 'p-1');
		if (r.ok) throw new Error('expected err');
		expect(r.error.code).toBe('player_has_history');
	});

	it('setPlayerLevel is staff-only, and says so', async () => {
		const db = fakeDb({ rpc: { error: { message: 'staff_only' } } });
		const r = await setPlayerLevel(db, 'p-1', 'yellow_advanced');
		if (r.ok) throw new Error('expected err');
		expect(r.error.code).toBe('staff_only');
	});
});

describe('listPlayers — scoped to the caller, not left to RLS alone', () => {
	it('reads active guardianships for the account and shapes the rows, sorted by name', async () => {
		const calls: unknown[] = [];
		const db = fakeDb({
			calls,
			table: {
				data: [
					{
						role: 'parent',
						players: {
							id: 'p-2',
							full_name: 'Zoe R.',
							birthdate: '2013-06-10',
							skill_levels: { key: 'yellow_intermediate', label: 'Yellow ball · intermediate' }
						}
					},
					{
						role: 'parent',
						players: {
							id: 'p-1',
							full_name: 'Maya R.',
							birthdate: '2015-03-01',
							skill_levels: null
						}
					}
				]
			}
		});
		const r = await listPlayers(db, 'acct-1');
		if (!r.ok) throw new Error('expected ok');
		expect(r.value.map((p) => p.fullName)).toEqual(['Maya R.', 'Zoe R.']);
		expect(r.value[0]).toEqual({
			id: 'p-1',
			fullName: 'Maya R.',
			birthdate: '2015-03-01',
			levelKey: null,
			levelLabel: null,
			relationship: 'parent'
		});
		expect(calls).toContainEqual(['from', 'guardianships']);
		expect(calls).toContainEqual(['eq', 'account_id', 'acct-1']);
		expect(calls).toContainEqual(['is', 'ended_at', null]);
	});

	it('an account with no players is an empty list, not an error', async () => {
		const r = await listPlayers(fakeDb({ table: { data: [] } }), 'acct-1');
		expect(r).toEqual({ ok: true, value: [] });
	});

	it('maps a query failure', async () => {
		const db = fakeDb({ table: { error: { code: '42501', message: 'row-level security' } } });
		const r = await listPlayers(db, 'acct-1');
		if (r.ok) throw new Error('expected err');
		expect(r.error.code).toBe('not_authorized');
	});
});

describe('listSkillLevels', () => {
	it('returns the active levels in rank order', async () => {
		const calls: unknown[] = [];
		const db = fakeDb({
			calls,
			table: {
				data: [
					{ key: 'orange', label: 'Orange ball' },
					{ key: 'green_beginner', label: 'Green ball · beginner' }
				]
			}
		});
		const r = await listSkillLevels(db);
		if (!r.ok) throw new Error('expected ok');
		expect(r.value).toEqual([
			{ value: 'orange', label: 'Orange ball' },
			{ value: 'green_beginner', label: 'Green ball · beginner' }
		]);
		expect(calls).toContainEqual(['eq', 'active', true]);
		expect(calls).toContainEqual(['order', 'rank']);
	});
});

describe('searchPlayers — the staff-only roster lookup', () => {
	it('matches on name, case-insensitively, and caps the result', async () => {
		const calls: unknown[] = [];
		const db = fakeDb({
			calls,
			table: { data: [{ id: 'p1', full_name: 'Maya R.', birthdate: '2014-04-02' }] }
		});
		const result = await searchPlayers(db, ' may ');
		expect(result.ok).toBe(true);
		if (!result.ok) return;
		expect(result.value[0]).toMatchObject({ id: 'p1', fullName: 'Maya R.' });
		expect(calls).toContainEqual(['ilike', 'full_name', '%may%']);
		expect(calls).toContainEqual(['limit', 20]);
	});

	it('an empty query asks for nothing rather than the whole academy', async () => {
		const calls: unknown[] = [];
		const db = fakeDb({ calls, table: { data: [] } });
		expect(await searchPlayers(db, '   ')).toEqual({ ok: true, value: [] });
		expect(calls).toHaveLength(0);
	});
});
