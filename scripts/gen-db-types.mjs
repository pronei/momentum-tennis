// Generates src/lib/server/db/database.types.ts in the shape `supabase gen types typescript` emits,
// by applying supabase/migrations/*.sql to an in-process PGlite and introspecting the catalog.
// No remote project or CLI needed — deterministic, runs in CI. Never hand-edit the output.
//
//   pnpm db:types
//
// When a Supabase project is connected, `supabase gen types typescript --linked` may replace this;
// the output shape is the same, so consumers don't change.
import { PGlite } from '@electric-sql/pglite';
import { btree_gist } from '@electric-sql/pglite/contrib/btree_gist';
import fs from 'node:fs';
import path from 'node:path';

const root = new URL('..', import.meta.url);
const migrationsDir = new URL('supabase/migrations/', root);
const outFile = new URL('src/lib/server/db/database.types.ts', root);

const db = new PGlite({ extensions: { btree_gist } });
await db.exec(`
  create schema auth;
  create table auth.users (id uuid primary key, email text);
  create function auth.uid() returns uuid language sql stable as $$ select null::uuid $$;
  create role anon nologin; create role authenticated nologin; create role service_role nologin;
`);
for (const file of fs
	.readdirSync(migrationsDir)
	.filter((f) => f.endsWith('.sql'))
	.sort()) {
	await db.exec(fs.readFileSync(new URL(file, migrationsDir), 'utf8'));
}

const q = async (sql, params) => (await db.query(sql, params)).rows;

// ── enums ──
const enums = new Map();
for (const r of await q(`
  select t.typname as name, array_agg(e.enumlabel order by e.enumsortorder) as labels
  from pg_type t join pg_enum e on e.enumtypid = t.oid join pg_namespace n on n.oid = t.typnamespace
  where n.nspname = 'public' group by t.typname order by t.typname`)) {
	enums.set(r.name, r.labels);
}

// ── type mapping (mirrors supabase's postgres → typescript table) ──
const scalar = {
	bool: 'boolean',
	int2: 'number',
	int4: 'number',
	int8: 'number',
	float4: 'number',
	float8: 'number',
	numeric: 'number',
	text: 'string',
	varchar: 'string',
	bpchar: 'string',
	uuid: 'string',
	date: 'string',
	time: 'string',
	timetz: 'string',
	timestamp: 'string',
	timestamptz: 'string',
	inet: 'string',
	citext: 'string',
	bytea: 'string',
	json: 'Json',
	jsonb: 'Json',
	void: 'undefined'
};
function tsType(udt, isArray = false) {
	const base = udt.startsWith('_') ? udt.slice(1) : udt;
	const arr = isArray || udt.startsWith('_');
	let t;
	if (scalar[base]) t = scalar[base];
	else if (enums.has(base)) t = `Database["public"]["Enums"]["${base}"]`;
	else t = 'unknown';
	return arr ? `${t}[]` : t;
}

// ── relations (tables + views) ──
const relations = await q(`
  select c.relname as name, c.relkind as kind
  from pg_class c join pg_namespace n on n.oid = c.relnamespace
  where n.nspname = 'public' and c.relkind in ('r','v') order by c.relname`);

const columnsFor = (rel) =>
	q(
		`select a.attname as name, t.typname as udt, a.attnotnull as notnull,
            a.atthasdef as hasdef, a.attidentity <> '' as identity, a.attgenerated <> '' as generated
     from pg_attribute a join pg_type t on t.oid = a.atttypid
     where a.attrelid = ('public.' || quote_ident($1))::regclass and a.attnum > 0 and not a.attisdropped
     order by a.attnum`,
		[rel]
	);

const fksFor = (rel) =>
	q(
		`select con.conname as name,
            (select array_agg(a.attname order by k.ord) from unnest(con.conkey) with ordinality k(attnum, ord)
               join pg_attribute a on a.attrelid = con.conrelid and a.attnum = k.attnum) as columns,
            confrel.relname as referenced,
            (select array_agg(a.attname order by k.ord) from unnest(con.confkey) with ordinality k(attnum, ord)
               join pg_attribute a on a.attrelid = con.confrelid and a.attnum = k.attnum) as referenced_columns,
            exists (select 1 from pg_index i where i.indrelid = con.conrelid and i.indisunique
                    and i.indkey::int2[] = con.conkey) as one_to_one
     from pg_constraint con join pg_class confrel on confrel.oid = con.confrelid
     where con.contype = 'f' and con.conrelid = ('public.' || quote_ident($1))::regclass
     order by con.conname`,
		[rel]
	);

const ind = (n) => '\t'.repeat(n);
const lit = (s) => JSON.stringify(s);

function rowType(cols, depth) {
	return cols
		.map((c) => `${ind(depth)}${c.name}: ${tsType(c.udt)}${c.notnull ? '' : ' | null'}`)
		.join('\n');
}
function insertType(cols, depth) {
	return cols
		.map((c) => {
			if (c.generated) return `${ind(depth)}${c.name}?: never`;
			const optional = !c.notnull || c.hasdef || c.identity;
			return `${ind(depth)}${c.name}${optional ? '?' : ''}: ${tsType(c.udt)}${c.notnull ? '' : ' | null'}`;
		})
		.join('\n');
}
function updateType(cols, depth) {
	return cols
		.map((c) =>
			c.generated
				? `${ind(depth)}${c.name}?: never`
				: `${ind(depth)}${c.name}?: ${tsType(c.udt)}${c.notnull ? '' : ' | null'}`
		)
		.join('\n');
}
function relationshipsType(fks, depth) {
	if (!fks.length) return `${ind(depth)}Relationships: []`;
	const items = fks
		.map(
			(f) =>
				`${ind(depth + 1)}{\n${ind(depth + 2)}foreignKeyName: ${lit(f.name)}\n${ind(depth + 2)}columns: [${f.columns.map(lit).join(', ')}]\n${ind(depth + 2)}isOneToOne: ${f.one_to_one}\n${ind(depth + 2)}referencedRelation: ${lit(f.referenced)}\n${ind(depth + 2)}referencedColumns: [${f.referenced_columns.map(lit).join(', ')}]\n${ind(depth + 1)}}`
		)
		.join(',\n');
	return `${ind(depth)}Relationships: [\n${items}\n${ind(depth)}]`;
}

const tables = [];
const views = [];
for (const r of relations) {
	const cols = await columnsFor(r.name);
	const fks = r.kind === 'r' ? await fksFor(r.name) : [];
	const d = 4;
	if (r.kind === 'r') {
		tables.push(
			`${ind(3)}${r.name}: {\n${ind(d)}Row: {\n${rowType(cols, d + 1)}\n${ind(d)}}\n${ind(d)}Insert: {\n${insertType(cols, d + 1)}\n${ind(d)}}\n${ind(d)}Update: {\n${updateType(cols, d + 1)}\n${ind(d)}}\n${relationshipsType(fks, d)}\n${ind(3)}}`
		);
	} else {
		views.push(
			`${ind(3)}${r.name}: {\n${ind(d)}Row: {\n${rowType(cols, d + 1)}\n${ind(d)}}\n${ind(d)}Relationships: []\n${ind(3)}}`
		);
	}
}

// ── functions (public, non-trigger, non-aggregate) ──
const fns = await q(`
  select p.proname as name, p.proargnames as argnames, p.proargtypes::oid[] as argtypes,
         p.pronargdefaults as ndefaults, p.proretset as retset,
         (select typname from pg_type where oid = p.prorettype) as rettype
  from pg_proc p join pg_namespace n on n.oid = p.pronamespace
  where n.nspname = 'public' and p.prokind = 'f'
    -- trigger and event-trigger functions are not callable through the API
    and p.prorettype not in ('trigger'::regtype, 'event_trigger'::regtype)
    -- PGlite installs extensions into public; Supabase uses the extensions schema. Skip them.
    and not exists (select 1 from pg_depend d where d.objid = p.oid and d.deptype = 'e')
  order by p.proname`);
const typeNames = new Map();
for (const r of await q(`select oid, typname from pg_type`))
	typeNames.set(Number(r.oid), r.typname);
const functions = fns.map((f) => {
	const argtypes = f.argtypes ?? [];
	const names = f.argnames ?? [];
	const required = argtypes.length - Number(f.ndefaults);
	const args = argtypes
		.map((oid, i) => {
			const name = names[i] ?? `arg${i + 1}`;
			return `${ind(5)}${name}${i >= required ? '?' : ''}: ${tsType(typeNames.get(Number(oid)) ?? 'unknown')}`;
		})
		.join('\n');
	const ret = f.rettype === 'void' ? 'undefined' : tsType(f.rettype);
	const argsBlock = args ? `{\n${args}\n${ind(4)}}` : 'Record<PropertyKey, never>';
	return `${ind(3)}${f.name}: {\n${ind(4)}Args: ${argsBlock}\n${ind(4)}Returns: ${f.retset ? `${ret}[]` : ret}\n${ind(3)}}`;
});

const enumsBlock = [...enums]
	.map(([name, labels]) => `${ind(3)}${name}: ${labels.map(lit).join(' | ')}`)
	.join('\n');

const out = `// GENERATED by scripts/gen-db-types.mjs from supabase/migrations — do not edit.
// Regenerate with: pnpm db:types
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
	public: {
		Tables: {
${tables.join('\n')}
		}
		Views: {
${views.join('\n')}
		}
		Functions: {
${functions.join('\n')}
		}
		Enums: {
${enumsBlock}
		}
		CompositeTypes: Record<never, never>
	}
}

type DefaultSchema = Database['public']

export type Tables<T extends keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])> =
	(DefaultSchema['Tables'] & DefaultSchema['Views'])[T] extends { Row: infer R } ? R : never
export type TablesInsert<T extends keyof DefaultSchema['Tables']> =
	DefaultSchema['Tables'][T] extends { Insert: infer I } ? I : never
export type TablesUpdate<T extends keyof DefaultSchema['Tables']> =
	DefaultSchema['Tables'][T] extends { Update: infer U } ? U : never
export type Enums<T extends keyof DefaultSchema['Enums']> = DefaultSchema['Enums'][T]
export type Functions<T extends keyof DefaultSchema['Functions']> = DefaultSchema['Functions'][T]
`;

fs.mkdirSync(path.dirname(outFile.pathname), { recursive: true });
fs.writeFileSync(outFile, out);
console.log(
	`database.types.ts: ${tables.length} tables, ${views.length} views, ${functions.length} functions, ${enums.size} enums`
);
await db.close();
