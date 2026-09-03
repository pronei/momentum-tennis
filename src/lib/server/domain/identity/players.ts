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
	// 'My child' is the common case; superforms uses this as the form's initial value
	relationship: z.enum(RELATIONSHIPS).default('parent'),
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

/**
 * Find players by name. Staff only in practice: `read_players` admits `is_staff()` or a guardian,
 * so a family account searching would only ever match its own children. An empty query asks for
 * nothing — a roster picker should not open by listing every child in the academy.
 */
export async function searchPlayers(
	db: PlayersDb,
	query: string
): Promise<Result<{ id: string; fullName: string; birthdate: string }[]>> {
	const q = query.trim();
	if (!q) return ok([]);
	const { data, error } = await db
		.from('players')
		.select('id, full_name, birthdate')
		.ilike('full_name', `%${q.toLowerCase()}%`)
		.order('full_name')
		.limit(20);
	if (error) return err(fromPostgres(error));
	return ok((data ?? []).map((p) => ({ id: p.id, fullName: p.full_name, birthdate: p.birthdate })));
}
