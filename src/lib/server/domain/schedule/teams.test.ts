import { describe, expect, it } from 'vitest';
import { called, fakeDb } from './fakes';
import {
	addMember,
	addTeamSession,
	createTeam,
	listTeams,
	removeMember,
	roster,
	teamSchema
} from './teams';

const LA = 'America/Los_Angeles';
const TEAM = '55555555-5555-5555-5555-555555555555';
const PLAYER = '88888888-8888-8888-8888-888888888888';
const COURT = '22222222-2222-2222-2222-222222222222';

describe('teamSchema', () => {
	it('a team is a name in a season', () => {
		expect(
			teamSchema.safeParse({ name: 'Momentum 14U', season: 'Fall 2026', description: '' }).success
		).toBe(true);
		expect(teamSchema.safeParse({ name: '', season: 'Fall 2026', description: '' }).success).toBe(
			false
		);
		expect(
			teamSchema.safeParse({ name: 'Momentum 14U', season: '', description: '' }).success
		).toBe(false);
	});
});

describe('teams', () => {
	it('lists teams by season then name', async () => {
		const calls: unknown[] = [];
		const db = fakeDb({ calls, tables: { teams: { data: [] } } });
		expect((await listTeams(db)).ok).toBe(true);
		expect(called(calls, 'order', 'season')).toBe(true);
		expect(called(calls, 'order', 'name')).toBe(true);
	});

	it('maps a duplicate name in a season to conflict', async () => {
		const db = fakeDb({
			tables: { teams: { error: { message: 'duplicate key', code: '23505' } } }
		});
		const result = await createTeam(db, {
			name: 'Momentum 14U',
			season: 'Fall 2026',
			description: ''
		});
		expect(result.ok).toBe(false);
		if (result.ok) return;
		expect(result.error.code).toBe('conflict');
	});

	it('reads the active roster only', async () => {
		const calls: unknown[] = [];
		const db = fakeDb({
			calls,
			tables: {
				team_members: {
					data: [
						{
							player_id: PLAYER,
							joined_at: '2026-09-01T00:00:00Z',
							left_at: null,
							players: {
								id: PLAYER,
								full_name: 'Maya R.',
								skill_levels: { key: 'orange', label: 'Orange ball' }
							}
						}
					]
				}
			}
		});
		const result = await roster(db, TEAM);
		expect(result.ok).toBe(true);
		if (!result.ok) return;
		expect(result.value[0]).toMatchObject({
			playerId: PLAYER,
			fullName: 'Maya R.',
			levelLabel: 'Orange ball'
		});
		expect(called(calls, 'is', 'left_at', null)).toBe(true);
	});

	it('removing a player ends the membership; it never deletes the record', async () => {
		const calls: unknown[] = [];
		const db = fakeDb({ calls, tables: { team_members: {} } });
		const result = await removeMember(db, TEAM, PLAYER);
		expect(result.ok).toBe(true);
		expect(called(calls, 'delete')).toBe(false);
		expect(called(calls, 'eq', 'team_id', TEAM)).toBe(true);
		expect(called(calls, 'eq', 'player_id', PLAYER)).toBe(true);
		const update = calls.find((c) => Array.isArray(c) && c[0] === 'update') as [
			string,
			{ left_at: string }
		];
		expect(typeof update[1].left_at).toBe('string');
	});

	it('re-adding a player who left clears the end date rather than duplicating the row', async () => {
		const calls: unknown[] = [];
		const db = fakeDb({ calls, tables: { team_members: {} } });
		const result = await addMember(db, TEAM, PLAYER);
		expect(result.ok).toBe(true);
		const upsert = calls.find((c) => Array.isArray(c) && c[0] === 'upsert') as [string, object];
		expect(upsert[1]).toMatchObject({ team_id: TEAM, player_id: PLAYER, left_at: null });
	});

	it('a practice is a team session on a court, through the one session writer', async () => {
		const calls: unknown[] = [];
		const db = fakeDb({ calls, tables: { sessions: { data: { id: 's2' } }, team_sessions: {} } });
		const result = await addTeamSession(
			db,
			TEAM,
			{
				date: '2026-09-15',
				start: '16:00',
				end: '17:30',
				courtId: COURT,
				coachId: '',
				kind: 'practice',
				opponent: '',
				homeAway: '',
				venueNote: ''
			},
			LA
		);
		expect(result).toEqual({ ok: true, value: { id: 's2' } });
		expect(
			called(calls, 'insert', {
				session_id: 's2',
				team_id: TEAM,
				kind: 'practice',
				opponent: null,
				home_away: null
			})
		).toBe(true);
	});

	it('an away match may be scheduled with no court but must name the opponent', async () => {
		const calls: unknown[] = [];
		const db = fakeDb({ calls, tables: { sessions: { data: { id: 's3' } }, team_sessions: {} } });
		const away = {
			date: '2026-09-19',
			start: '15:00',
			end: '18:00',
			courtId: '',
			coachId: '',
			kind: 'match' as const,
			opponent: 'Bay Club',
			homeAway: 'away' as const,
			venueNote: 'Bay Club courts 3–5'
		};
		expect((await addTeamSession(db, TEAM, away, LA)).ok).toBe(true);
		const bad = await addTeamSession(db, TEAM, { ...away, opponent: '' }, LA);
		expect(bad.ok).toBe(false);
		if (bad.ok) return;
		expect(bad.error.code).toBe('validation');
	});
});
