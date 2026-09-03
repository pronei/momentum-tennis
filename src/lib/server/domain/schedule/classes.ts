import { z } from 'zod';
import { err, fromPostgres, ok, type Result } from '$lib/server/domain/result';
import { isoWeekday, localDate, localTime, type ScheduleDb, uuid } from './common';

// Terms and the weekly class TEMPLATE. A template stores local wall-clock values and is
// expanded per date by `generate_class_sessions`, which converts with the academy timezone —
// so an occurrence keeps its 09:00 across the November DST change instead of sliding an hour.
// Nothing here precomputes a UTC offset; that is the bug the model was shaped to avoid.

/** §12 of the design system: a class is three equal blocks, 2h at the weekend, 1.5h midweek. */
export const DURATIONS = [90, 120] as const;

export const termSchema = z
	.object({
		name: z.string().trim().min(1, 'Name the term').max(120, 'Too long'),
		startsOn: localDate,
		endsOn: localDate
	})
	.refine((v) => v.endsOn > v.startsOn, {
		path: ['endsOn'],
		message: 'End after the start'
	});
export type TermInput = z.infer<typeof termSchema>;

export const classSchema = z.object({
	termId: uuid,
	name: z.string().trim().min(1, 'Name the class').max(120, 'Too long'),
	weekday: isoWeekday,
	startTimeLocal: localTime,
	durationMinutes: z.coerce
		.number()
		.int()
		.refine((v) => (DURATIONS as readonly number[]).includes(v), 'Weekend 120, weekday 90'),
	capacity: z.coerce.number().int().min(1, 'At least one seat').max(64, 'Too many'),
	// '' until Artur knows which court the venue gave him
	defaultCourtId: z.union([uuid, z.literal('')]).default(''),
	defaultCoachId: z.union([uuid, z.literal('')]).default('')
});
export type ClassInput = z.infer<typeof classSchema>;

export type Term = { id: string; name: string; startsOn: string; endsOn: string };
export type ClassTemplate = {
	id: string;
	termId: string;
	name: string;
	weekday: number;
	startTimeLocal: string;
	durationMinutes: number;
	capacity: number;
	defaultCourtId: string | null;
	defaultCoachId: string | null;
	courtName: string | null;
	coachName: string | null;
	levelKeys: string[];
};

type TermRow = { id: string; name: string; starts_on: string; ends_on: string };
type ClassRow = {
	id: string;
	term_id: string;
	name: string;
	weekday: number;
	start_time_local: string;
	duration_minutes: number;
	capacity: number;
	default_court_id: string | null;
	default_coach_id: string | null;
	courts: { name: string } | null;
	accounts: { full_name: string } | null;
	class_skill_levels: { skill_levels: { key: string; rank: number } | null }[] | null;
};

const CLASS_SELECT =
	'id, term_id, name, weekday, start_time_local, duration_minutes, capacity, default_court_id, default_coach_id, courts ( name ), accounts ( full_name ), class_skill_levels ( skill_levels ( key, rank ) )';

const toTemplate = (c: ClassRow): ClassTemplate => ({
	id: c.id,
	termId: c.term_id,
	name: c.name,
	weekday: c.weekday,
	startTimeLocal: c.start_time_local.slice(0, 5),
	durationMinutes: c.duration_minutes,
	capacity: c.capacity,
	defaultCourtId: c.default_court_id,
	defaultCoachId: c.default_coach_id,
	courtName: c.courts?.name ?? null,
	coachName: c.accounts?.full_name ?? null,
	levelKeys: (c.class_skill_levels ?? [])
		.map((t) => t.skill_levels)
		.filter((l): l is { key: string; rank: number } => l !== null)
		.sort((a, b) => a.rank - b.rank)
		.map((l) => l.key)
});

export async function listTerms(db: ScheduleDb): Promise<Result<Term[]>> {
	const { data, error } = await db
		.from('terms')
		.select('id, name, starts_on, ends_on')
		.order('starts_on');
	if (error) return err(fromPostgres(error));
	return ok(
		((data ?? []) as unknown as TermRow[]).map((t) => ({
			id: t.id,
			name: t.name,
			startsOn: t.starts_on,
			endsOn: t.ends_on
		}))
	);
}

export async function createTerm(
	db: ScheduleDb,
	input: TermInput
): Promise<Result<{ id: string }>> {
	const { data, error } = await db
		.from('terms')
		.insert({ name: input.name, starts_on: input.startsOn, ends_on: input.endsOn })
		.select('id')
		.single();
	if (error) return err(fromPostgres(error));
	return ok({ id: (data as { id: string }).id });
}

export async function listClasses(
	db: ScheduleDb,
	termId: string
): Promise<Result<ClassTemplate[]>> {
	const { data, error } = await db
		.from('classes')
		.select(CLASS_SELECT)
		.eq('term_id', termId)
		.order('weekday')
		.order('start_time_local');
	if (error) return err(fromPostgres(error));
	return ok(((data ?? []) as unknown as ClassRow[]).map(toTemplate));
}

export async function getClass(db: ScheduleDb, id: string): Promise<Result<ClassTemplate | null>> {
	const { data, error } = await db.from('classes').select(CLASS_SELECT).eq('id', id).maybeSingle();
	if (error) return err(fromPostgres(error));
	return ok(data ? toTemplate(data as unknown as ClassRow) : null);
}

const templateRow = (input: ClassInput) => ({
	name: input.name,
	weekday: input.weekday,
	start_time_local: input.startTimeLocal,
	duration_minutes: input.durationMinutes,
	capacity: input.capacity,
	default_court_id: input.defaultCourtId || null,
	default_coach_id: input.defaultCoachId || null
});

export async function createClass(
	db: ScheduleDb,
	input: ClassInput
): Promise<Result<{ id: string }>> {
	const { data, error } = await db
		.from('classes')
		.insert({ term_id: input.termId, ...templateRow(input) })
		.select('id')
		.single();
	if (error) return err(fromPostgres(error));
	return ok({ id: (data as { id: string }).id });
}

/** The term is not in the patch: moving a class between terms would orphan its occurrences. */
export async function updateClass(
	db: ScheduleDb,
	id: string,
	input: ClassInput
): Promise<Result<null>> {
	const { error } = await db.from('classes').update(templateRow(input)).eq('id', id);
	if (error) return err(fromPostgres(error));
	return ok(null);
}

/** Replace the template's level tags. Occurrences generated afterwards inherit them (0001). */
export async function setClassLevels(
	db: ScheduleDb,
	classId: string,
	levelKeys: string[]
): Promise<Result<{ tagged: number }>> {
	const { data, error } = await db.rpc('set_class_levels', {
		p_class: classId,
		p_level_keys: levelKeys
	});
	if (error) return err(fromPostgres(error));
	return ok({ tagged: (data as number) ?? 0 });
}

/**
 * Materialize the template into sessions across a date range — normally the whole term, and
 * re-runnable: an occurrence whose court is not reserved (or is already taken) is skipped and
 * reported rather than failing the run, so Artur can fix the window and generate again.
 */
export async function generateOccurrences(
	db: ScheduleDb,
	classId: string,
	from: string,
	to: string
): Promise<Result<{ created: number; skipped: string[] }>> {
	const { data, error } = await db.rpc('generate_class_sessions', {
		p_class: classId,
		p_from: from,
		p_to: to
	});
	if (error) return err(fromPostgres(error));
	const out = (data ?? { created: 0, skipped: [] }) as { created: number; skipped: string[] };
	return ok({ created: out.created ?? 0, skipped: out.skipped ?? [] });
}
