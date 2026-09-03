import { z } from 'zod';
import { err, fromPostgres, ok, type Result } from '$lib/server/domain/result';
import { localDate, localTime, type ScheduleDb, uuid } from './common';
import { createSession, listByParent, type ScheduleSession } from './sessions';

// USTA Junior Team Tennis. A roster is a set of named players; a team session is a practice or
// a match, and only an away match may have no court — that rule lives in `sessionSchema`, which
// this module reuses rather than restating.

export const teamSchema = z.object({
	name: z.string().trim().min(1, 'Name the team').max(120, 'Too long'),
	season: z.string().trim().min(1, 'Name the season').max(64, 'Too long'),
	description: z.string().trim().max(1000, 'Too long').default('')
});
export type TeamInput = z.infer<typeof teamSchema>;

export const teamSessionSchema = z.object({
	date: localDate,
	start: localTime,
	end: localTime,
	courtId: z.union([uuid, z.literal('')]).default(''),
	coachId: z.union([uuid, z.literal('')]).default(''),
	kind: z.enum(['practice', 'match']).default('practice'),
	opponent: z.string().trim().max(120, 'Too long').default(''),
	homeAway: z.union([z.enum(['home', 'away']), z.literal('')]).default(''),
	venueNote: z.string().trim().max(240, 'Too long').default('')
});
export type TeamSessionInput = z.infer<typeof teamSessionSchema>;

export type Team = { id: string; name: string; season: string; description: string | null };
export type RosterEntry = {
	playerId: string;
	fullName: string;
	joinedAt: string;
	levelKey: string | null;
	levelLabel: string | null;
};

type TeamRow = { id: string; name: string; season: string; description: string | null };
type MemberRow = {
	player_id: string;
	joined_at: string;
	left_at: string | null;
	players: {
		id: string;
		full_name: string;
		skill_levels: { key: string; label: string } | null;
	} | null;
};

export async function listTeams(db: ScheduleDb): Promise<Result<Team[]>> {
	const { data, error } = await db
		.from('teams')
		.select('id, name, season, description')
		.order('season', { ascending: false })
		.order('name');
	if (error) return err(fromPostgres(error));
	return ok((data ?? []) as unknown as TeamRow[]);
}

export async function getTeam(db: ScheduleDb, id: string): Promise<Result<Team | null>> {
	const { data, error } = await db
		.from('teams')
		.select('id, name, season, description')
		.eq('id', id)
		.maybeSingle();
	if (error) return err(fromPostgres(error));
	return ok((data as unknown as TeamRow) ?? null);
}

export async function createTeam(
	db: ScheduleDb,
	input: TeamInput
): Promise<Result<{ id: string }>> {
	const { data, error } = await db
		.from('teams')
		.insert({ name: input.name, season: input.season, description: input.description || null })
		.select('id')
		.single();
	if (error) return err(fromPostgres(error));
	return ok({ id: (data as { id: string }).id });
}

export async function updateTeam(
	db: ScheduleDb,
	id: string,
	input: TeamInput
): Promise<Result<null>> {
	const { error } = await db
		.from('teams')
		.update({ name: input.name, season: input.season, description: input.description || null })
		.eq('id', id);
	if (error) return err(fromPostgres(error));
	return ok(null);
}

/** Who is on the team now. A player who left keeps their row; this asks for the active ones. */
export async function roster(db: ScheduleDb, teamId: string): Promise<Result<RosterEntry[]>> {
	const { data, error } = await db
		.from('team_members')
		.select('player_id, joined_at, left_at, players ( id, full_name, skill_levels ( key, label ) )')
		.eq('team_id', teamId)
		.is('left_at', null);
	if (error) return err(fromPostgres(error));
	return ok(
		((data ?? []) as unknown as MemberRow[])
			.map((m) => ({
				playerId: m.player_id,
				fullName: m.players?.full_name ?? '',
				joinedAt: m.joined_at,
				levelKey: m.players?.skill_levels?.key ?? null,
				levelLabel: m.players?.skill_levels?.label ?? null
			}))
			.sort((a, b) => a.fullName.localeCompare(b.fullName))
	);
}

/** (team, player) is the primary key, so re-joining reopens the same row instead of duplicating. */
export async function addMember(
	db: ScheduleDb,
	teamId: string,
	playerId: string
): Promise<Result<null>> {
	const { error } = await db
		.from('team_members')
		.upsert({ team_id: teamId, player_id: playerId, left_at: null });
	if (error) return err(fromPostgres(error));
	return ok(null);
}

/** Leaving is dated, never deleted — a season roster is a record of who actually played. */
export async function removeMember(
	db: ScheduleDb,
	teamId: string,
	playerId: string
): Promise<Result<null>> {
	const { error } = await db
		.from('team_members')
		.update({ left_at: new Date().toISOString() })
		.eq('team_id', teamId)
		.eq('player_id', playerId);
	if (error) return err(fromPostgres(error));
	return ok(null);
}

export async function addTeamSession(
	db: ScheduleDb,
	teamId: string,
	input: TeamSessionInput,
	tz: string
): Promise<Result<{ id: string }>> {
	return createSession(
		db,
		{
			type: 'team',
			parentId: teamId,
			courtId: input.courtId,
			coachId: input.coachId,
			date: input.date,
			start: input.start,
			end: input.end,
			kind: input.kind,
			opponent: input.opponent,
			homeAway: input.homeAway,
			notes: '',
			venueNote: input.venueNote
		},
		tz
	);
}

export const listTeamSessions = (
	db: ScheduleDb,
	teamId: string
): Promise<Result<ScheduleSession[]>> => listByParent(db, 'team', teamId);
