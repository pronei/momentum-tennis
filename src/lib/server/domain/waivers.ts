import type { SupabaseClient } from '@supabase/supabase-js';
import { z } from 'zod';
import type { Database } from '$lib/server/db/database.types';
import { err, fromPostgres, ok, type Result } from '$lib/server/domain/result';

// Consent. The database owns every rule that matters — which version is current, who may sign
// and in what capacity, that a minor never signs for themselves, and that signatures and
// published versions are append-only. This module names those calls and shapes what the UI reads.
//
// The document TEXT comes from the academy's lawyer. Nothing here writes or judges it.

export type WaiversDb = Pick<SupabaseClient<Database>, 'from' | 'rpc'>;

export const documentSchema = z.object({
	slug: z
		.string()
		.trim()
		.toLowerCase()
		.min(1, 'Enter a short name')
		.max(64, 'Too long')
		.regex(/^[a-z0-9-]+$/, 'Lower case, digits and hyphens only'),
	title: z.string().trim().min(1, 'Enter a title').max(120, 'Too long'),
	requiredForParticipation: z.boolean().default(true)
});
export type DocumentInput = z.infer<typeof documentSchema>;

export const draftSchema = z.object({
	contentMd: z.string().trim().min(1, 'Paste the text supplied by the academy lawyer')
});
export type DraftInput = z.infer<typeof draftSchema>;

/** A typed name and a ticked box. Neither alone is consent. */
export const signSchema = z.object({
	typedName: z.string().trim().min(1, 'Type your full name').max(120, 'Too long'),
	agree: z.literal(true, { message: 'Tick the box to sign' })
});
export type SignInput = z.infer<typeof signSchema>;

export type VersionRef = { id: string; version: number; publishedAt: string | null };
export type WaiverDocument = {
	id: string;
	slug: string;
	title: string;
	requiredForParticipation: boolean;
	currentVersion: VersionRef | null;
	draft: VersionRef | null;
};
export type WaiverStatus = {
	documentId: string;
	slug: string;
	title: string;
	versionId: string;
	version: number;
	publishedAt: string | null;
	satisfied: boolean;
};

type StatusRow = {
	document_id: string;
	slug: string;
	waiver_version_id: string;
	satisfied: boolean;
};
type VersionRow = {
	id: string;
	version: number;
	published_at: string | null;
	waiver_documents: { id: string; title: string; slug: string } | null;
};
type DocRow = { id: string; slug: string; title: string; required_for_participation: boolean };
type FlatVersionRow = {
	id: string;
	document_id: string;
	version: number;
	published_at: string | null;
};

/**
 * Every required document, with the version that counts today and whether this player has
 * signed exactly that version. `v_player_waiver_status` is the same source the booking gate
 * uses, so the portal cannot show "covered" while booking says otherwise.
 */
export async function playerWaiverStatus(
	db: WaiversDb,
	playerId: string
): Promise<Result<WaiverStatus[]>> {
	const { data, error } = await db
		.from('v_player_waiver_status')
		.select('document_id, slug, waiver_version_id, satisfied')
		.eq('player_id', playerId);
	if (error) return err(fromPostgres(error));
	const rows = (data ?? []) as unknown as StatusRow[];
	if (!rows.length) return ok([]);

	// The view carries no titles; fetch them with the versions it points at.
	const { data: versions, error: vError } = await db
		.from('waiver_versions')
		.select('id, version, published_at, waiver_documents ( id, title, slug )')
		.in(
			'id',
			rows.map((r) => r.waiver_version_id)
		);
	if (vError) return err(fromPostgres(vError));
	const byId = new Map(((versions ?? []) as unknown as VersionRow[]).map((v) => [v.id, v]));

	return ok(
		rows
			.map((r) => {
				const v = byId.get(r.waiver_version_id);
				return {
					documentId: r.document_id,
					slug: r.slug,
					title: v?.waiver_documents?.title ?? r.slug,
					versionId: r.waiver_version_id,
					version: v?.version ?? 0,
					publishedAt: v?.published_at ?? null,
					satisfied: r.satisfied
				};
			})
			.sort((a, b) => a.title.localeCompare(b.title))
	);
}

/** True when any required document is unsigned — the portal's re-consent gate. */
export const needsReconsent = (status: { satisfied: boolean }[]): boolean =>
	status.some((s) => !s.satisfied);

/** Admin view: each document with the version in force and any draft awaiting publication. */
export async function listDocuments(db: WaiversDb): Promise<Result<WaiverDocument[]>> {
	const { data: docs, error } = await db
		.from('waiver_documents')
		.select('id, slug, title, required_for_participation')
		.order('title');
	if (error) return err(fromPostgres(error));
	const { data: versions, error: vError } = await db
		.from('waiver_versions')
		.select('id, document_id, version, published_at')
		.order('version');
	if (vError) return err(fromPostgres(vError));

	const rows = (versions ?? []) as unknown as FlatVersionRow[];
	return ok(
		((docs ?? []) as unknown as DocRow[]).map((d) => {
			const mine = rows.filter((v) => v.document_id === d.id);
			const published = mine.filter((v) => v.published_at !== null);
			const draft = mine.find((v) => v.published_at === null) ?? null;
			const current = published.length ? published[published.length - 1] : null;
			const ref = (v: FlatVersionRow | null): VersionRef | null =>
				v ? { id: v.id, version: v.version, publishedAt: v.published_at } : null;
			return {
				id: d.id,
				slug: d.slug,
				title: d.title,
				requiredForParticipation: d.required_for_participation,
				currentVersion: ref(current),
				draft: ref(draft)
			};
		})
	);
}

export async function listVersions(
	db: WaiversDb,
	documentId: string
): Promise<Result<(VersionRef & { contentMd: string; contentSha256: string })[]>> {
	const { data, error } = await db
		.from('waiver_versions')
		.select('id, version, published_at, content_md, content_sha256')
		.eq('document_id', documentId)
		.order('version');
	if (error) return err(fromPostgres(error));
	return ok(
		(data ?? []).map((v) => ({
			id: v.id,
			version: v.version,
			publishedAt: v.published_at,
			contentMd: v.content_md,
			contentSha256: v.content_sha256
		}))
	);
}

/** How many players a publish would force back through signing — the consequence line. */
export async function signerCountForDocument(
	db: WaiversDb,
	documentId: string
): Promise<Result<number>> {
	const { data, error } = await db
		.from('v_player_waiver_status')
		.select('player_id, satisfied')
		.eq('document_id', documentId);
	if (error) return err(fromPostgres(error));
	return ok((data ?? []).filter((r) => r.satisfied).length);
}

export async function createDocument(
	db: WaiversDb,
	input: DocumentInput
): Promise<Result<{ documentId: string }>> {
	const { data, error } = await db
		.from('waiver_documents')
		.insert({
			slug: input.slug,
			title: input.title,
			required_for_participation: input.requiredForParticipation
		})
		.select('id')
		.single();
	if (error) return err(fromPostgres(error));
	return ok({ documentId: (data as { id: string }).id });
}

export async function createDraft(
	db: WaiversDb,
	documentId: string,
	contentMd: string
): Promise<Result<{ versionId: string }>> {
	const { data, error } = await db.rpc('create_waiver_draft', {
		p_document: documentId,
		p_content: contentMd
	});
	if (error) return err(fromPostgres(error));
	return ok({ versionId: data as string });
}

export async function updateDraft(
	db: WaiversDb,
	versionId: string,
	contentMd: string
): Promise<Result<void>> {
	const { error } = await db.rpc('update_waiver_draft', {
		p_version: versionId,
		p_content: contentMd
	});
	if (error) return err(fromPostgres(error));
	return ok(undefined);
}

/** From here the text is frozen and every earlier signature stops satisfying the gate. */
export async function publishVersion(db: WaiversDb, versionId: string): Promise<Result<void>> {
	const { error } = await db.rpc('publish_waiver_version', { p_version: versionId });
	if (error) return err(fromPostgres(error));
	return ok(undefined);
}

export async function signWaiver(
	db: WaiversDb,
	input: {
		versionId: string;
		playerId: string;
		typedName: string;
		ip?: string | null;
		userAgent?: string | null;
	}
): Promise<Result<{ signatureId: string }>> {
	const { data, error } = await db.rpc('sign_waiver', {
		p_version: input.versionId,
		p_player: input.playerId,
		p_typed_name: input.typedName.trim(),
		// optional in SQL: omit rather than send null, so the declared defaults apply
		...(input.ip ? { p_ip: input.ip } : {}),
		...(input.userAgent ? { p_user_agent: input.userAgent } : {})
	});
	if (error) return err(fromPostgres(error));
	return ok({ signatureId: data as string });
}
