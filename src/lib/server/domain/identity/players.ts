import type { SupabaseClient } from '@supabase/supabase-js';
import { z } from 'zod';
import type { Database } from '$lib/server/db/database.types';
import { err, fromPostgres, ok, type Result } from '$lib/server/domain/result';

export type PlayersDb = Pick<SupabaseClient<Database>, 'from' | 'rpc'>;

/** The relationships a guardian may claim for themselves. `other` is staff-assigned only. */
export const RELATIONSHIPS = ['self', 'parent', 'legal_guardian'] as const;
export type Relationship = (typeof RELATIONSHIPS)[number];

const fullName = z.string().trim().min(1, 'Enter a name').max(120, 'Too long');
const birthdate = z
	.string()
	.regex(/^\d{4}-\d{2}-\d{2}$/, 'Use YYYY-MM-DD')
	.refine((v) => !Number.isNaN(Date.parse(`${v}T12:00:00Z`)), 'That date does not exist')
	.refine((v) => v <= new Date().toISOString().slice(0, 10), 'A birthdate is in the past')
	.refine((v) => v >= '1900-01-01', 'Check the year');

/** Adding a player. The level is optional — the academy sets it if the family does not. */
export const newPlayerSchema = z.object({
	fullName,
	birthdate,
	relationship: z.enum(RELATIONSHIPS),
	skillLevelKey: z.string().trim().default('')
});
export type NewPlayerInput = z.infer<typeof newPlayerSchema>;

/** Editing a player. Level is absent by design: only staff move players (decision M). */
export const editPlayerSchema = z.object({ fullName, birthdate });
export type EditPlayerInput = z.infer<typeof editPlayerSchema>;

export type PlayerSummary = {
	id: string;
	fullName: string;
	birthdate: string;
	levelKey: string | null;
	levelLabel: string | null;
	relationship: Relationship | 'other';
};

type GuardianshipRow = {
	role: PlayerSummary['relationship'];
	players: {
		id: string;
		full_name: string;
		birthdate: string;
		skill_levels: { key: string; label: string } | null;
	} | null;
};

/**
 * The players this account actively guards. Scoped explicitly rather than leaning on RLS:
 * `read_players` also admits staff, and a coach who is also a parent must still see only
 * their own family in the portal.
 */
export async function listPlayers(
	db: PlayersDb,
	accountId: string
): Promise<Result<PlayerSummary[]>> {
	const { data, error } = await db
		.from('guardianships')
		.select('role, players ( id, full_name, birthdate, skill_levels ( key, label ) )')
		.eq('account_id', accountId)
		.is('ended_at', null);
	if (error) return err(fromPostgres(error));
	const rows = (data ?? []) as unknown as GuardianshipRow[];
	return ok(
		rows
			.filter((r): r is GuardianshipRow & { players: NonNullable<GuardianshipRow['players']> } =>
				Boolean(r.players)
			)
			.map((r) => ({
				id: r.players.id,
				fullName: r.players.full_name,
				birthdate: r.players.birthdate,
				levelKey: r.players.skill_levels?.key ?? null,
				levelLabel: r.players.skill_levels?.label ?? null,
				relationship: r.role
			}))
			.sort((a, b) => a.fullName.localeCompare(b.fullName))
	);
}

/** Ball levels for a Select, in the academy's own order. */
export async function listSkillLevels(
	db: PlayersDb
): Promise<Result<{ value: string; label: string }[]>> {
	const { data, error } = await db
		.from('skill_levels')
		.select('key, label')
		.eq('active', true)
		.order('rank');
	if (error) return err(fromPostgres(error));
	return ok((data ?? []).map((l) => ({ value: l.key, label: l.label })));
}

export async function createPlayer(
	db: PlayersDb,
	input: NewPlayerInput
): Promise<Result<{ playerId: string }>> {
	const { data, error } = await db.rpc('create_player', {
		p_full_name: input.fullName,
		p_birthdate: input.birthdate,
		p_role: input.relationship,
		// '' would be rejected as an unknown level: omit the argument so the SQL default
		// (null — "the academy will set it") applies.
		...(input.skillLevelKey ? { p_skill_level_key: input.skillLevelKey } : {})
	});
	if (error) return err(fromPostgres(error));
	return ok({ playerId: data as string });
}

export async function updatePlayer(
	db: PlayersDb,
	playerId: string,
	input: EditPlayerInput
): Promise<Result<void>> {
	const { error } = await db.rpc('update_player', {
		p_player: playerId,
		p_full_name: input.fullName,
		p_birthdate: input.birthdate
	});
	if (error) return err(fromPostgres(error));
	return ok(undefined);
}

/** Ends this account's link. The player row and any history survive (see 0002). */
export async function archivePlayer(db: PlayersDb, playerId: string): Promise<Result<void>> {
	const { error } = await db.rpc('archive_player', { p_player: playerId });
	if (error) return err(fromPostgres(error));
	return ok(undefined);
}

/** Staff only — progression is the academy's call (decision M). */
export async function setPlayerLevel(
	db: PlayersDb,
	playerId: string,
	skillLevelKey: string
): Promise<Result<void>> {
	const { error } = await db.rpc('set_player_level', {
		p_player: playerId,
		p_skill_level_key: skillLevelKey
	});
	if (error) return err(fromPostgres(error));
	return ok(undefined);
}
