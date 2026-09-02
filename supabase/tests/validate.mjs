// Schema v2 validation harness — runs the real schema in PGlite (Postgres-in-WASM) and
// exercises every invariant: availability gate, EXCLUDE double-booking, level-tagged slots,
// weekly cap, waiver gate, ledger immutability, cancellation + forgiveness policy, waitlist,
// finalization from attendance, RLS as a family login, audit, idempotent expiry.
//   pnpm db:test   (also wrapped by vitest: supabase/tests/schema.test.ts)
import { PGlite } from '@electric-sql/pglite';
import { btree_gist } from '@electric-sql/pglite/contrib/btree_gist';
import fs from 'node:fs';

const db = new PGlite({ extensions: { btree_gist } });
const q = (sql, params) => db.query(sql, params);
const ok = (label) => console.log('  ✓', label);
let failures = 0;
async function expectErr(label, fn, needle) {
	try {
		await fn();
		console.log('  ✗', label, '— expected error containing:', needle);
		failures++;
	} catch (e) {
		if (String(e.message).includes(needle)) ok(label + ' → ' + needle);
		else {
			console.log('  ✗', label, '— wrong error:', e.message);
			failures++;
		}
	}
}
async function expectOk(label, fn) {
	try {
		const r = await fn();
		ok(label);
		return r;
	} catch (e) {
		console.log('  ✗', label, '—', e.message);
		failures++;
	}
}
const asUser = (id) => q(`select set_config('request.jwt.claim.sub', $1, false)`, [id ?? '']);

// ── Supabase-shaped harness: auth schema, roles ──
await db.exec(`
  create schema auth;
  create table auth.users (id uuid primary key, email text);
  create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
  create role anon nologin; create role authenticated nologin; create role service_role nologin;
`);

console.log('1. schema loads');
const sql =
	fs.readFileSync(new URL('../migrations/0001_schema.sql', import.meta.url), 'utf8') +
	'\n' +
	fs.readFileSync(new URL('../seed.sql', import.meta.url), 'utf8');
try {
	await db.exec(sql);
	ok('schema-v2.sql applied without error');
} catch (e) {
	console.log('  ✗ schema failed:', e.message);
	process.exit(1);
}
// Supabase grants these by default (default privileges); emulate so RLS — not ACLs — is what we test
await db.exec(`grant usage on schema public, auth to anon, authenticated, service_role;
  grant select, insert, update, delete on all tables in schema public to anon, authenticated, service_role;
  grant execute on function auth.uid() to anon, authenticated, service_role;`);
ok('Supabase-default table grants emulated');

console.log('2. actors');
const ADMIN = '11111111-1111-1111-1111-111111111111',
	PARENT = '22222222-2222-2222-2222-222222222222',
	COACH = '33333333-3333-3333-3333-333333333333',
	PARENT2 = '44444444-4444-4444-4444-444444444444';
for (const [id, em] of [
	[ADMIN, 'artur@x'],
	[PARENT, 'priya@x'],
	[COACH, 'coach@x'],
	[PARENT2, 'sam@x']
])
	await q('insert into auth.users values ($1,$2)', [id, em]);
const acct = await q('select count(*)::int as n from accounts');
if (acct.rows[0].n === 4) ok('auth trigger mirrored 4 accounts');
await q(`insert into staff_members values ($1,'admin'),($1,'coach'),($2,'coach')`, [ADMIN, COACH]);
await asUser(PARENT);
const maya = (
	await q(`select create_player('Maya R.', '2015-03-01', 'parent', 'green_intermediate') as id`)
).rows[0].id;
const zoe = (
	await q(`select create_player('Zoe R.',  '2013-06-10', 'parent', 'yellow_intermediate') as id`)
).rows[0].id;
await asUser(PARENT2);
const leo = (await q(`select create_player('Leo T.',  '2014-01-05', 'parent', 'orange') as id`))
	.rows[0].id;
const kai = (await q(`select create_player('Kai T.',  '2016-09-09', 'parent') as id`)).rows[0].id; // level unknown yet
await expectErr(
	'unknown level key refused',
	() => q(`select create_player('X', '2016-01-01', 'parent', 'purple')`),
	'unknown_skill_level'
);
const lv = (
	await q(
		`select sl.key from players p join skill_levels sl on sl.id = p.skill_level_id where p.id = $1`,
		[maya]
	)
).rows[0].key;
if (lv === 'green_intermediate') ok('level stored at creation (green_intermediate)');
else {
	console.log('  ✗ level', lv);
	failures++;
}
await expectErr(
	'parent cannot change level (staff only)',
	() => q(`select set_player_level($1, 'yellow_advanced')`, [maya]),
	'staff_only'
);
await expectErr(
	'minor cannot be own guardian',
	() => q(`select create_player('Kid', '2016-01-01', 'self')`),
	'minor_self_link'
);
ok('two players under one parent + one under another');

console.log('3. facilities + availability (H)');
const loc = (await q(`select id from locations where name = 'Murdock Park'`)).rows[0].id;
const court = (
	await q(`insert into courts (location_id, name) values ($1,'MP-1') returning id`, [loc])
).rows[0].id;
const court2 = (
	await q(`insert into courts (location_id, name) values ($1,'MP-2') returning id`, [loc])
).rows[0].id;
// dates computed IN Postgres (ISO Monday two weeks out, academy-local) — no JS timezone ambiguity
const D = (
	await q(`select m::text as monday, (m+1)::text as tuesday, (m+5)::text as saturday, (m+7)::text as next_monday,
                           (m-7)::text as prev_monday, (m-1)::text as prev_sunday, (m+13)::text as next_sunday, (m+8)::text as next_tuesday
                    from (select date_trunc('week', (academy_local(now())::date + 14)::timestamp)::date as m) x`)
).rows[0];
const monday = D.monday,
	tuesday = D.tuesday,
	saturday = D.saturday,
	nextMonday = D.next_monday;
console.log('  dates:', JSON.stringify(D));
for (const c of [court, court2])
	for (const [wd] of [[1], [2]])
		await q(
			`insert into court_availability (court_id, weekday, open_local, close_local, effective_from) values ($1,$2,'16:00','20:00',$3)`,
			[c, wd, monday]
		);
await q(
	`insert into court_availability (court_id, weekday, open_local, close_local, effective_from, lesson_bookable) values ($1,6,'09:00','13:00',$2,false)`,
	[court, monday]
);
ok('reserved Mon/Tue 16–20 on two courts, Sat 09–13 (classes only)');
await expectErr(
	'session outside reserved window refused',
	() =>
		q(
			`insert into sessions (session_type, starts_at, ends_at, court_id) values ('team', ($1::date + time '10:00') at time zone academy_tz(), ($1::date + time '11:00') at time zone academy_tz(), $2)`,
			[monday, court]
		),
	'court_unavailable'
);
await expectOk('session inside reserved window accepted', () =>
	q(
		`insert into sessions (session_type, starts_at, ends_at, court_id) values ('team', ($1::date + time '18:30') at time zone academy_tz(), ($1::date + time '19:30') at time zone academy_tz(), $2)`,
		[tuesday, court2]
	)
);
await expectErr(
	'EXCLUDE: overlapping session on same court refused',
	() =>
		q(
			`insert into sessions (session_type, starts_at, ends_at, court_id) values ('team', ($1::date + time '19:00') at time zone academy_tz(), ($1::date + time '20:00') at time zone academy_tz(), $2)`,
			[tuesday, court2]
		),
	'no_court_overlap'
);
await expectErr(
	'shrinking availability under a scheduled session refused',
	() => q(`delete from court_availability where court_id = $1 and weekday = 2`, [court2]),
	'availability_in_use'
);
await expectErr(
	'rainout closure under a scheduled session refused',
	() =>
		q(
			`insert into court_availability_exceptions (court_id, on_date, kind) values ($1,$2,'closed')`,
			[court2, tuesday]
		),
	'availability_in_use'
);

console.log('4. classes + generation');
const term = (
	await q(
		`insert into terms (name, starts_on, ends_on) values ('Test term', $1, $1::date + 60) returning id`,
		[monday]
	)
).rows[0].id;
const clsMon = (
	await q(
		`insert into classes (term_id, name, weekday, start_time_local, duration_minutes, capacity, default_court_id, default_coach_id) values ($1,'Green Mon',1,'16:00',90,2,$2,$3) returning id`,
		[term, court, COACH]
	)
).rows[0].id;
const clsTue = (
	await q(
		`insert into classes (term_id, name, weekday, start_time_local, duration_minutes, capacity, default_court_id, default_coach_id) values ($1,'Green Tue',2,'16:00',90,2,$2,$3) returning id`,
		[term, court, COACH]
	)
).rows[0].id;
const clsSat = (
	await q(
		`insert into classes (term_id, name, weekday, start_time_local, duration_minutes, capacity, default_court_id) values ($1,'Sat all levels',6,'09:00',120,2,$2) returning id`,
		[term, court]
	)
).rows[0].id;
await q(
	`insert into class_skill_levels select $1, id from skill_levels where key in ('green_intermediate','green_advanced')`,
	[clsMon]
);
await expectErr(
	'generation is admin-only',
	() => q(`select generate_class_sessions($1,$2,$3)`, [clsMon, monday, nextMonday]),
	'admin_only'
);
await asUser(ADMIN);
const gen = (
	await q(`select generate_class_sessions($1,$2,$3) as r`, [clsMon, monday, D.next_sunday])
).rows[0].r;
if (gen.created === 2 && gen.skipped.length === 0)
	ok('Mon class: 2 occurrences generated across 2 weeks');
else {
	console.log('  ✗ gen', gen);
	failures++;
}
const genOut = (
	await q(`select generate_class_sessions($1,$2,$3) as r`, [clsMon, D.prev_monday, D.prev_sunday])
).rows[0].r;
if (genOut.created === 0 && genOut.skipped.length === 1)
	ok('occurrence before availability effective_from skipped + reported');
else {
	console.log('  ✗ genOut', genOut);
	failures++;
}
await q(`select generate_class_sessions($1,$2,$3)`, [clsTue, monday, D.next_sunday]);
await q(`select generate_class_sessions($1,$2,$3)`, [clsSat, monday, D.next_sunday]);
const sess = async (cls, d) =>
	(
		await q(
			`select s.id from sessions s join class_sessions cs on cs.session_id = s.id where cs.class_id = $1 and academy_local(s.starts_at)::date = $2`,
			[cls, d]
		)
	).rows[0].id;
const monW1 = await sess(clsMon, monday),
	tueW1 = await sess(clsTue, tuesday),
	satW1 = await sess(clsSat, saturday),
	monW2 = await sess(clsMon, nextMonday),
	tueW2 = await sess(clsTue, D.next_tuesday);
const tags = (
	await q(`select count(*)::int as n from session_skill_levels where session_id = $1`, [monW1])
).rows[0].n;
if (tags === 2) ok('class level tags copied onto each occurrence');
else {
	console.log('  ✗ tags', tags);
	failures++;
}
const dst = (
	await q(`select academy_local(starts_at)::time as t from sessions where id = $1`, [monW1])
).rows[0].t;
if (String(dst).startsWith('16:00')) ok('occurrence lands at 16:00 local (DST-correct expansion)');
else {
	console.log('  ✗ local time', dst);
	failures++;
}

console.log('5. waiver gate (F/G)');
const doc = (await q(`select id from waiver_documents where slug = 'liability'`)).rows[0].id;
const v1 = (
	await q(
		`insert into waiver_versions (document_id, version, content_md, content_sha256) values ($1,1,'FROM LEGAL v1','sha1') returning id`,
		[doc]
	)
).rows[0].id;
await expectOk('draft version editable', () =>
	q(`update waiver_versions set content_md = 'FROM LEGAL v1 (edited)' where id = $1`, [v1])
);
await q(`update waiver_versions set published_at = now() where id = $1`, [v1]);
await expectErr(
	'published version frozen',
	() => q(`update waiver_versions set content_md = 'tamper' where id = $1`, [v1]),
	'append-only'
);
await asUser(PARENT);
await expectErr(
	'booking blocked before consent',
	() => q(`select book_class($1,$2)`, [maya, monW1]),
	'waiver_required'
);
await expectOk('guardian signs for Maya', () =>
	q(`select sign_waiver($1,$2,'Priya R.')`, [v1, maya])
);
await expectOk('guardian signs for Zoe', () =>
	q(`select sign_waiver($1,$2,'Priya R.')`, [v1, zoe])
);
await asUser(PARENT2);
await expectOk('other parent signs for Leo', () =>
	q(`select sign_waiver($1,$2,'Sam T.')`, [v1, leo])
);
await expectOk('other parent signs for Kai', () =>
	q(`select sign_waiver($1,$2,'Sam T.')`, [v1, kai])
);
await expectErr(
	"cannot sign for someone else's child",
	() => q(`select sign_waiver($1,$2,'Sam T.')`, [v1, maya]),
	'not_authorized'
);
const sig = (
	await q(`select capacity, relationship_snapshot from waiver_signatures where player_id = $1`, [
		maya
	])
).rows[0];
if (sig.capacity === 'guardian' && sig.relationship_snapshot === 'parent')
	ok('signature records capacity=guardian, relationship=parent');
else {
	console.log('  ✗ sig', sig);
	failures++;
}
await expectErr(
	'signatures immutable',
	() => q(`delete from waiver_signatures where player_id = $1`, [maya]),
	'append-only'
);

console.log('6. scoped credits + weekly cap (A/B/I)');
await asUser(ADMIN); // admin grants go through the one issuance path
const grant = (p, kind, n, key) =>
	q(`select issue_credits($1,$2,$3,$4, null, null, null, 'admin grant') as id`, [p, kind, n, key]);
await grant(maya, 'class_weekday', 10, 'grant:maya:wd');
await grant(maya, 'class_weekend', 10, 'grant:maya:we');
await grant(zoe, 'class_weekday', 10, 'grant:zoe:wd');
await grant(leo, 'class_weekday', 1, 'grant:leo:wd');
await grant(kai, 'class_weekday', 1, 'grant:kai:wd');
await grant(maya, 'private_lesson', 3, 'grant:maya:pl');
await grant(zoe, 'private_lesson', 2, 'grant:zoe:pl');
const dup = (await grant(maya, 'class_weekday', 10, 'grant:maya:wd')).rows[0].id;
if (dup === null) ok('re-issuing the same idempotency key is a no-op (webhook retry safe)');
else {
	console.log('  ✗ dup', dup);
	failures++;
}
const val = (
	await q(
		`select (expires_at::date - created_at::date) as days, forgiven_skips from credit_ledger where idempotency_key = 'grant:maya:wd'`
	)
).rows[0];
if (val.days === 77 && val.forgiven_skips === 1)
	ok('validity = 70 days + 7 per forgiven skip = 77; allowance snapshotted on the lot');
else {
	console.log('  ✗ validity', val);
	failures++;
}
await asUser(PARENT);
await expectErr(
	'parent cannot issue credits',
	() => grant(maya, 'class_weekday', 99, 'hack:1'),
	'admin_only'
);
await expectErr(
	'ledger rows cannot be updated',
	() => q(`update credit_ledger set delta = 99 where idempotency_key = 'grant:maya:wd'`),
	'append-only'
);
await asUser(PARENT);
const b1 = (await q(`select book_class($1,$2) as id`, [maya, monW1])).rows[0].id;
ok('Maya (green_intermediate) books Mon — slot offers her level');
await asUser(PARENT2);
await expectErr(
	'Leo (orange) refused on a green-tagged slot',
	() => q(`select book_class($1,$2)`, [leo, monW1]),
	'level_mismatch'
);
await expectErr(
	'Kai (no level yet) refused on a tagged slot',
	() => q(`select book_class($1,$2)`, [kai, monW1]),
	'level_required'
);
const kaiB = await expectOk('Kai books an untagged (all-levels) slot', () =>
	q(`select book_class($1,$2) as id`, [kai, tueW2])
);
await asUser(PARENT);
await expectErr(
	'same session twice refused',
	() => q(`select book_class($1,$2)`, [maya, monW1]),
	'already_booked'
);
await expectErr(
	'second WEEKDAY class in the same ISO week refused (cap)',
	() => q(`select book_class($1,$2)`, [maya, tueW1]),
	'weekly_cap'
);
await expectOk('WEEKEND class in the same week allowed (separate scope)', () =>
	q(`select book_class($1,$2)`, [maya, satW1])
);
await expectOk("next week's Monday allowed", () => q(`select book_class($1,$2)`, [maya, monW2]));
let bal = (
	await q(`select credit_kind, balance from v_credit_balances where player_id = $1 order by 1`, [
		maya
	])
).rows;
if (
	bal.find((r) => r.credit_kind === 'class_weekday').balance === 8 &&
	bal.find((r) => r.credit_kind === 'class_weekend').balance === 9
)
	ok('balances derived: weekday 8, weekend 9');
else {
	console.log('  ✗ bal', bal);
	failures++;
}
await expectErr(
	'Zoe has no weekend credits',
	() => q(`select book_class($1,$2)`, [zoe, satW1]),
	'insufficient_credits'
);

console.log('7. cancellation policy (C) + waitlist (K)');
const st = (await q(`select cancel_booking('class', $1) as s`, [b1])).rows[0].s.status;
if (st === 'cancelled') ok('cancel with ≥24h notice → cancelled');
else {
	console.log('  ✗ status', st);
	failures++;
}
bal = (
	await q(
		`select balance from v_credit_balances where player_id = $1 and credit_kind = 'class_weekday'`,
		[maya]
	)
).rows[0].balance;
if (bal === 9) ok('credit reversed → weekday balance 9');
else {
	console.log('  ✗ bal after cancel', bal);
	failures++;
}
await expectOk('cap freed: Tue class now bookable', () =>
	q(`select book_class($1,$2)`, [maya, tueW1])
);
await expectOk('Zoe books Tue (capacity 2 → full)', () =>
	q(`select book_class($1,$2)`, [zoe, tueW1])
);
await asUser(PARENT2);
const wl = (await q(`select book_class($1,$2) as id`, [leo, tueW1])).rows[0].id;
const wls = (await q(`select status from class_bookings where id = $1`, [wl])).rows[0].status;
if (wls === 'waitlisted') ok('third player waitlisted (class full)');
else {
	console.log('  ✗ waitlist', wls);
	failures++;
}
let leoBal = (await q(`select balance from v_credit_balances where player_id = $1`, [leo])).rows[0]
	.balance;
if (leoBal === 1) ok('waitlist holds no credit');
else {
	console.log('  ✗ leo bal', leoBal);
	failures++;
}
await asUser(PARENT);
const zoeB = (
	await q(`select id from class_bookings where player_id = $1 and class_session_id = $2`, [
		zoe,
		tueW1
	])
).rows[0].id;
await q(`select cancel_booking('class', $1)`, [zoeB]);
await asUser(ADMIN);
const promoted = (await q(`select promote_waitlist($1) as n`, [tueW1])).rows[0].n;
const wls2 = (await q(`select status from class_bookings where id = $1`, [wl])).rows[0].status;
leoBal = (await q(`select balance from v_credit_balances where player_id = $1`, [leo])).rows[0]
	.balance;
if (promoted === 1 && wls2 === 'booked' && leoBal === 0)
	ok('promotion books Leo and consumes his credit');
else {
	console.log('  ✗ promote', promoted, wls2, leoBal);
	failures++;
}
const cancelledN = (await q(`select cancel_session($1, 'rainout') as n`, [tueW1])).rows[0].n;
leoBal = (await q(`select balance from v_credit_balances where player_id = $1`, [leo])).rows[0]
	.balance;
if (cancelledN === 2 && leoBal === 1)
	ok('rainout: session cancelled, every booked player made whole');
else {
	console.log('  ✗ rainout', cancelledN, leoBal);
	failures++;
}

console.log('7b. forgiveness — one skipped week per package (L)');
await asUser(ADMIN);
await q(`update academy_settings set cancel_notice_hours = 100000`); // make every cancel "late"
await asUser(PARENT);
const mw2 = (
	await q(`select id from class_bookings where player_id = $1 and class_session_id = $2`, [
		maya,
		monW2
	])
).rows[0].id;
const late1 = (await q(`select cancel_booking('class', $1) as s`, [mw2])).rows[0].s;
bal = (
	await q(
		`select balance from v_credit_balances where player_id = $1 and credit_kind = 'class_weekday'`,
		[maya]
	)
).rows[0].balance;
if (late1.status === 'cancelled_late' && late1.forgiven === true && bal === 10)
	ok('first late cancel on the weekday pack: forgiven, credit returned (10)');
else {
	console.log('  ✗ late1', late1, bal);
	failures++;
}
const rb = (await q(`select book_class($1,$2) as id`, [maya, monW1])).rows[0].id;
const late2 = (await q(`select cancel_booking('class', $1) as s`, [rb])).rows[0].s;
bal = (
	await q(
		`select balance from v_credit_balances where player_id = $1 and credit_kind = 'class_weekday'`,
		[maya]
	)
).rows[0].balance;
if (late2.status === 'cancelled_late' && late2.forgiven === false && bal === 9)
	ok('second late cancel on the same pack: forfeited (9)');
else {
	console.log('  ✗ late2', late2, bal);
	failures++;
}
await asUser(ADMIN);
await q(`update academy_settings set cancel_notice_hours = 24`);
// no-show path: coach marks Maya absent on Saturday; finalization settles it and forgives (weekend pack allowance unused)
await q(
	`insert into session_attendance (session_id, player_id, present, marked_by) values ($1,$2,false,$3)`,
	[satW1, maya, COACH]
);
const fin = (await q(`select finalize_bookings(now() + interval '60 days') as n`)).rows[0].n;
const satStatus = (
	await q(`select status from class_bookings where player_id = $1 and class_session_id = $2`, [
		maya,
		satW1
	])
).rows[0].status;
const weBal = (
	await q(
		`select balance from v_credit_balances where player_id = $1 and credit_kind = 'class_weekend'`,
		[maya]
	)
).rows[0].balance;
if (satStatus === 'no_show' && weBal === 10)
	ok(`finalization: absent → no_show → forgiven on the weekend pack (${fin} bookings settled)`);
else {
	console.log('  ✗ noshow', satStatus, weBal, fin);
	failures++;
}
const kaiStatus = (await q(`select status from class_bookings where id = $1`, [kaiB.rows[0].id]))
	.rows[0].status;
if (kaiStatus === 'completed') ok('no attendance record → completed (benefit of the doubt)');
else {
	console.log('  ✗ kai status', kaiStatus);
	failures++;
}
const forgiveRows = (
	await q(`select count(*)::int as n from credit_ledger where entry_type = 'forgive'`)
).rows[0].n;
if (forgiveRows === 2)
	ok('exactly two forgive rows (one per pack), each idempotent on its consume');
else {
	console.log('  ✗ forgive rows', forgiveRows);
	failures++;
}

console.log('8. private lessons');
await asUser(PARENT);
await expectOk('lesson on reserved Mon 18:00 with coach', () =>
	q(
		`select book_private_lesson($1,$2,$3, ($4::date + time '18:00') at time zone academy_tz(), ($4::date + time '19:00') at time zone academy_tz()) as id`,
		[maya, COACH, court2, monday]
	)
);
await expectErr(
	'same court/time again → slot_taken',
	() =>
		q(
			`select book_private_lesson($1,$2,$3, ($4::date + time '18:30') at time zone academy_tz(), ($4::date + time '19:30') at time zone academy_tz())`,
			[zoe, ADMIN, court2, monday]
		),
	'slot_taken'
);
await expectErr(
	'same coach elsewhere at that time → slot_taken (coach EXCLUDE)',
	() =>
		q(
			`select book_private_lesson($1,$2,$3, ($4::date + time '18:00') at time zone academy_tz(), ($4::date + time '19:00') at time zone academy_tz())`,
			[zoe, COACH, court, monday]
		),
	'slot_taken'
);
await expectErr(
	'Saturday window is classes-only → not lesson-bookable',
	() =>
		q(
			`select book_private_lesson($1,$2,$3, ($4::date + time '10:00') at time zone academy_tz(), ($4::date + time '11:00') at time zone academy_tz())`,
			[maya, COACH, court, saturday]
		),
	'slot_not_bookable'
);
await expectErr(
	'non-coach as coach refused',
	() =>
		q(
			`select book_private_lesson($1,$2,$3, ($4::date + time '19:00') at time zone academy_tz(), ($4::date + time '20:00') at time zone academy_tz())`,
			[maya, PARENT2, court, monday]
		),
	'not_a_coach'
);

console.log('9. RLS as a real family login');
await db.exec('set role authenticated');
await asUser(PARENT);
const vis = (await q(`select full_name from players order by 1`)).rows.map((r) => r.full_name);
if (vis.join(',') === 'Maya R.,Zoe R.') ok('parent sees only own players: ' + vis.join(', '));
else {
	console.log('  ✗ visibility', vis);
	failures++;
}
const led = (await q(`select count(*)::int as n from credit_ledger`)).rows[0].n;
if (led > 0) ok(`parent sees own children's ledger rows (${led})`);
else {
	console.log('  ✗ ledger hidden');
	failures++;
}
await expectErr(
	'parent cannot insert ledger rows',
	() =>
		q(
			`insert into credit_ledger (player_id, entry_type, delta, credit_kind, idempotency_key) values ($1,'adjust',100,'class_weekday','hack')`,
			[maya]
		),
	'policy'
);
await asUser(PARENT2);
const vis2 = (await q(`select full_name from players order by 1`)).rows.map((r) => r.full_name);
if (vis2.join(',') === 'Kai T.,Leo T.') ok('other parent sees only Kai + Leo');
else {
	console.log('  ✗ visibility2', vis2);
	failures++;
}
const led2 = (await q(`select count(*)::int as n from credit_ledger where player_id = $1`, [maya]))
	.rows[0].n;
if (led2 === 0) ok("cannot see another family's ledger");
else {
	console.log('  ✗ ledger leak', led2);
	failures++;
}
await db.exec('reset role');

console.log('10. audit + expiry');
const audit = (
	await q(
		`select count(*)::int as n from audit_log where entity_type in ('sessions','class_bookings','waiver_versions')`
	)
).rows[0].n;
if (audit > 5) ok(`audit_log captured ${audit} schedule/booking/consent rows`);
else {
	console.log('  ✗ audit', audit);
	failures++;
}
await asUser(null);
await q(
	`insert into credit_ledger (player_id, entry_type, delta, credit_kind, expires_at, idempotency_key) values ($1,'adjust',5,'class_weekday', now() - interval '1 day', 'grant:old')`,
	[zoe]
);
const exp = (await q(`select expire_credits() as n`)).rows[0].n;
const zoeBal = (
	await q(
		`select balance from v_credit_balances where player_id = $1 and credit_kind='class_weekday'`,
		[zoe]
	)
).rows[0].balance;
if (exp === 1 && zoeBal === 10)
	ok('expired lot written off; balance excludes it; idempotent key expire:lot:…');
else {
	console.log('  ✗ expire', exp, zoeBal);
	failures++;
}
await q(`select expire_credits() as n`);
const expRows = (await q(`select count(*)::int as n from credit_ledger where entry_type='expire'`))
	.rows[0].n;
if (expRows === 1) ok('re-running expiry does not double-write');
else {
	console.log('  ✗ expire dup', expRows);
	failures++;
}

console.log(failures ? `\n${failures} FAILURE(S)` : '\nALL CHECKS PASSED');
process.exit(failures ? 1 : 0);
