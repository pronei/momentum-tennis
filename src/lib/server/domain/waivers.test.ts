import { describe, expect, it } from 'vitest';
import {
	createDraft,
	getVersion,
	documentSchema,
	draftSchema,
	listDocuments,
	needsReconsent,
	playerWaiverStatus,
	publishVersion,
	signSchema,
	signWaiver,
	signerCountForDocument,
	updateDraft,
	type WaiversDb
} from './waivers';

type Reply = { data?: unknown; error?: { message: string; code?: string } | null };

function chain(reply: Reply, calls: unknown[]) {
	const c: Record<string, unknown> = {};
	for (const m of ['select', 'eq', 'in', 'is', 'order', 'insert', 'maybeSingle', 'single']) {
		c[m] = (...args: unknown[]) => {
			calls.push([m, ...args]);
			return c;
		};
	}
	c.then = (resolve: (v: Reply) => unknown) =>
		Promise.resolve({ data: null, error: null, ...reply }).then(resolve);
	return c;
}

/** Dispatches per table so a function that reads two of them can be exercised honestly. */
function fakeDb(
	opts: { tables?: Record<string, Reply>; rpc?: Reply; calls?: unknown[] } = {}
): WaiversDb {
	const calls = opts.calls ?? [];
	return {
		from: (table: string) => {
			calls.push(['from', table]);
			return chain(opts.tables?.[table] ?? {}, calls);
		},
		rpc: (fn: string, args: Record<string, unknown>) => {
			calls.push(['rpc', fn, args]);
			return Promise.resolve({ data: null, error: null, ...(opts.rpc ?? {}) });
		}
	} as unknown as WaiversDb;
}

describe('schemas — the boundary between a form and consent data', () => {
	it('a document needs a kebab-case slug and a title', () => {
		expect(documentSchema.parse({ slug: ' Liability ', title: 'Participation waiver' }).slug).toBe(
			'liability'
		);
		expect(documentSchema.safeParse({ slug: 'has space', title: 'x' }).success).toBe(false);
		expect(documentSchema.safeParse({ slug: 'ok', title: '  ' }).success).toBe(false);
	});
	it('a draft cannot be empty — an empty waiver is not a waiver', () => {
		expect(draftSchema.safeParse({ contentMd: '' }).success).toBe(false);
		expect(draftSchema.safeParse({ contentMd: '   ' }).success).toBe(false);
		expect(draftSchema.safeParse({ contentMd: 'FROM LEGAL' }).success).toBe(true);
	});
	it('signing needs a typed name AND the box ticked — neither alone is consent', () => {
		expect(signSchema.safeParse({ typedName: 'Priya R.', agree: true }).success).toBe(true);
		expect(signSchema.safeParse({ typedName: 'Priya R.', agree: false }).success).toBe(false);
		expect(signSchema.safeParse({ typedName: '  ', agree: true }).success).toBe(false);
	});
});

describe('playerWaiverStatus — what the portal and the booking gate both read', () => {
	const statusRows = [
		{ document_id: 'd2', slug: 'media', waiver_version_id: 'v9', satisfied: false },
		{ document_id: 'd1', slug: 'liability', waiver_version_id: 'v3', satisfied: true }
	];
	const versionRows = [
		{
			id: 'v3',
			version: 3,
			published_at: '2026-06-01T00:00:00Z',
			waiver_documents: { id: 'd1', title: 'Participation waiver', slug: 'liability' }
		},
		{
			id: 'v9',
			version: 2,
			published_at: '2025-09-14T00:00:00Z',
			waiver_documents: { id: 'd2', title: 'Media release', slug: 'media' }
		}
	];

	it('merges the status view with the version facts, sorted by title', async () => {
		const calls: unknown[] = [];
		const db = fakeDb({
			calls,
			tables: {
				v_player_waiver_status: { data: statusRows },
				waiver_versions: { data: versionRows }
			}
		});
		const r = await playerWaiverStatus(db, 'p-1');
		if (!r.ok) throw new Error('expected ok');
		expect(r.value).toEqual([
			{
				documentId: 'd2',
				slug: 'media',
				title: 'Media release',
				versionId: 'v9',
				version: 2,
				publishedAt: '2025-09-14T00:00:00Z',
				satisfied: false
			},
			{
				documentId: 'd1',
				slug: 'liability',
				title: 'Participation waiver',
				versionId: 'v3',
				version: 3,
				publishedAt: '2026-06-01T00:00:00Z',
				satisfied: true
			}
		]);
		expect(calls).toContainEqual(['eq', 'player_id', 'p-1']);
	});

	it('is empty when no published document requires participation — it never invents a gate', async () => {
		const r = await playerWaiverStatus(
			fakeDb({ tables: { v_player_waiver_status: { data: [] } } }),
			'p-1'
		);
		expect(r).toEqual({ ok: true, value: [] });
	});

	it('maps a query failure rather than reporting the player as covered', async () => {
		const db = fakeDb({
			tables: { v_player_waiver_status: { error: { code: '42501', message: 'denied' } } }
		});
		const r = await playerWaiverStatus(db, 'p-1');
		if (r.ok) throw new Error('expected err');
		expect(r.error.code).toBe('not_authorized');
	});

	it('needsReconsent is true when any required document is unsatisfied', () => {
		expect(needsReconsent([{ satisfied: true }, { satisfied: false }])).toBe(true);
		expect(needsReconsent([{ satisfied: true }])).toBe(false);
		expect(needsReconsent([])).toBe(false);
	});
});

describe('signWaiver', () => {
	it('passes the version, player and typed name, and records the request context', async () => {
		const calls: unknown[] = [];
		const r = await signWaiver(fakeDb({ rpc: { data: 'sig-1' }, calls }), {
			versionId: 'v3',
			playerId: 'p-1',
			typedName: '  Priya R. ',
			ip: '203.0.113.7',
			userAgent: 'Firefox'
		});
		expect(calls).toEqual([
			[
				'rpc',
				'sign_waiver',
				{
					p_version: 'v3',
					p_player: 'p-1',
					p_typed_name: 'Priya R.',
					p_ip: '203.0.113.7',
					p_user_agent: 'Firefox'
				}
			]
		]);
		expect(r).toEqual({ ok: true, value: { signatureId: 'sig-1' } });
	});

	it('maps every refusal the RPC can raise', async () => {
		for (const [message, code] of [
			['not_current_version', 'not_current_version'],
			['minor_cannot_self_sign', 'minor_cannot_self_sign'],
			['name_required', 'name_required'],
			['not_authorized', 'not_authorized']
		]) {
			const r = await signWaiver(fakeDb({ rpc: { error: { message } } }), {
				versionId: 'v3',
				playerId: 'p-1',
				typedName: 'X'
			});
			if (r.ok) throw new Error('expected err');
			expect(r.error.code).toBe(code);
		}
	});
});

describe('authoring', () => {
	it('createDraft passes the document and text', async () => {
		const calls: unknown[] = [];
		const r = await createDraft(fakeDb({ rpc: { data: 'v4' }, calls }), 'd1', 'FROM LEGAL v4');
		expect(calls).toEqual([
			['rpc', 'create_waiver_draft', { p_document: 'd1', p_content: 'FROM LEGAL v4' }]
		]);
		expect(r).toEqual({ ok: true, value: { versionId: 'v4' } });
	});
	it('updateDraft and publishVersion surface already_published', async () => {
		const published = { rpc: { error: { message: 'already_published' } } };
		const u = await updateDraft(fakeDb(published), 'v3', 'tamper');
		const p = await publishVersion(fakeDb(published), 'v3');
		if (u.ok || p.ok) throw new Error('expected err');
		expect(u.error.code).toBe('already_published');
		expect(p.error.code).toBe('already_published');
	});
	it('listDocuments reports the current version and any open draft per document', async () => {
		const db = fakeDb({
			tables: {
				waiver_documents: {
					data: [
						{
							id: 'd1',
							slug: 'liability',
							title: 'Participation waiver',
							required_for_participation: true
						}
					]
				},
				waiver_versions: {
					data: [
						{ id: 'v1', document_id: 'd1', version: 1, published_at: '2026-06-01T00:00:00Z' },
						{ id: 'v2', document_id: 'd1', version: 2, published_at: null }
					]
				}
			}
		});
		const r = await listDocuments(db);
		if (!r.ok) throw new Error('expected ok');
		expect(r.value).toEqual([
			{
				id: 'd1',
				slug: 'liability',
				title: 'Participation waiver',
				requiredForParticipation: true,
				currentVersion: { id: 'v1', version: 1, publishedAt: '2026-06-01T00:00:00Z' },
				draft: { id: 'v2', version: 2, publishedAt: null }
			}
		]);
	});
	it('signerCountForDocument counts the players a publish would force to re-consent', async () => {
		const db = fakeDb({
			tables: {
				v_player_waiver_status: {
					data: [
						{ player_id: 'p-1', satisfied: true },
						{ player_id: 'p-2', satisfied: true },
						{ player_id: 'p-3', satisfied: false }
					]
				}
			}
		});
		const r = await signerCountForDocument(db, 'd1');
		expect(r).toEqual({ ok: true, value: 2 });
	});
});

describe('getVersion — what the signing screen shows', () => {
	it('returns the exact text, its stamp, and whether it is still the current version', async () => {
		const db = fakeDb({
			tables: {
				waiver_versions: {
					data: {
						id: 'v3',
						version: 3,
						published_at: '2026-06-01T00:00:00Z',
						content_md: 'FROM LEGAL',
						content_sha256: 'abc',
						document_id: 'd1',
						waiver_documents: { id: 'd1', title: 'Participation waiver', slug: 'liability' }
					}
				},
				v_current_waiver_versions: { data: { waiver_version_id: 'v3' } }
			}
		});
		const r = await getVersion(db, 'v3');
		if (!r.ok) throw new Error('expected ok');
		expect(r.value).toEqual({
			id: 'v3',
			documentId: 'd1',
			title: 'Participation waiver',
			slug: 'liability',
			version: 3,
			publishedAt: '2026-06-01T00:00:00Z',
			contentMd: 'FROM LEGAL',
			contentSha256: 'abc',
			isCurrent: true
		});
	});

	it('reports a superseded version as not current, so the screen can say so', async () => {
		const db = fakeDb({
			tables: {
				waiver_versions: {
					data: {
						id: 'v2',
						version: 2,
						published_at: '2025-01-01T00:00:00Z',
						content_md: 'older',
						content_sha256: 'def',
						document_id: 'd1',
						waiver_documents: { id: 'd1', title: 'Participation waiver', slug: 'liability' }
					}
				},
				v_current_waiver_versions: { data: { waiver_version_id: 'v3' } }
			}
		});
		const r = await getVersion(db, 'v2');
		if (!r.ok || !r.value) throw new Error('expected a version');
		expect(r.value.isCurrent).toBe(false);
	});

	it('returns null for a version that does not exist', async () => {
		const r = await getVersion(fakeDb({ tables: { waiver_versions: { data: null } } }), 'nope');
		expect(r).toEqual({ ok: true, value: null });
	});
});
