# Operations runbook — what the operator does, in order

Everything a developer can do is done by CI and the scripts. This is the rest: the accounts,
secrets and one-time links only a person with the right logins can create. Start with
`pnpm env:check` — it prints, per environment, what is still unconfigured.

The repository is **public under AGPL-3.0** (the LICENSE from the initial commit). Nothing
secret is in it by construction: `pnpm env:check` refuses a secret in a committed file, and the
design system's photo originals are gitignored. The publishable Supabase key in
`.env.development` is public by design — RLS is the guard.

Secrets live in exactly two places: `.env.local` (gitignored — app secrets the code demands
lazily, plus an operator-only section the scripts read) and the Cloudflare project's secrets.
`.env.example` is the annotated list of both.

## 0. Layout

| environment | branch        | Cloudflare worker    | Supabase project                       | Stripe |
|-------------|---------------|----------------------|----------------------------------------|--------|
| dev         | `deploy/dev`  | `momentum-tennis-dev` | `rjiagjfvsaaxezsxfuzq` (Free, OrioleDB) | test   |
| live        | `deploy/live` | `momentum-tennis`     | to be created (Pro, standard Postgres) | live   |

Profiles: `config/dev.yaml`, `config/prod.yaml`. Flow: work → `main` → `deploy/dev` → `deploy/live`.

## 1. GitHub

- Remote: `git@github.com:pronei/momentum-tennis.git`. Default branch `main`.
- CI (`.github/workflows/ci.yml`) runs on every push and PR: env:check, types current, check,
  lint, test, build. Nothing to configure.
- Migrations: the **Supabase GitHub integration** (project dashboard → Integrations → GitHub) is
  connected with production branch `deploy/dev`, so Supabase applies `supabase/migrations` itself
  on every push to that branch. After a phase lands, confirm in dashboard → Database → Migrations
  that the new version is listed. `.github/workflows/migrate.yml` is the **manual fallback**
  (Actions → Migrate database → Run workflow, pick the branch): it runs `pnpm db:push <profile>`
  and needs one repository secret per environment:

  | secret | where it comes from |
  |---|---|
  | `SUPABASE_DB_PASSWORD_DEV` | dashboard → project → Settings → Database (reset it there if unknown) — **set** |
  | `SUPABASE_DB_PASSWORD_PROD` | when the production project exists |

  Nothing else: the project ref and pooler host are public facts in `config/*.yaml`, and no
  personal access token is involved. (A `SUPABASE_PROJECT_REF_DEV` secret was set before the
  workflow was simplified; it is unused and can be deleted.)

## 2. Supabase — dev project

The Supabase MCP in this workspace belongs to a different account, so use the scripts, the CLI,
or the dashboard. No `supabase login` or `supabase link` is needed anywhere: the scripts connect
to the database directly with its password.

**Apply the schema** (`.env.local` holds `SUPABASE_DB_PASSWORD_DEV`; the ref and pooler are in
`config/dev.yaml`):

```bash
pnpm db:push dev              # applies supabase/migrations in order; --dry-run lists them first
```

From a network without IPv6 add `--pooler` (the direct host is IPv6-only; CI does this
automatically). Verify the schema landed — this returns the six ball levels once it has:

```bash
curl -s "https://rjiagjfvsaaxezsxfuzq.supabase.co/rest/v1/skill_levels?select=key,rank&order=rank" \
  -H "apikey: $(grep PUBLIC_SUPABASE_PUBLISHABLE_KEY .env.development | cut -d= -f2)"
```

Ad-hoc inspection: `brew install libpq`, then
`/opt/homebrew/opt/libpq/bin/psql "host=db.rjiagjfvsaaxezsxfuzq.supabase.co dbname=postgres user=postgres sslmode=require"`
with the password from `.env.local`.

**Storage engine.** The dev project was created with **OrioleDB** (Supabase's alpha storage
engine; `show default_table_access_method` says `orioledb`). The constraints the booking
guarantees rest on — GiST exclusion for double-booking, partial unique indexes for the weekly
cap — were verified to be enforced on OrioleDB tables, and the migrations use nothing it lacks.
**Create the production project as standard Postgres** (pick "Postgres", not "OrioleDB", when
creating it): a money ledger does not belong on an alpha engine. Recreating dev the same way is
optional and would give exact parity; the schema applies unchanged either way.

**RLS safety net.** The `ensure_rls` event trigger you created by hand in dev is now migration
`0006` (identical function, replaced idempotently), so production gets it too. Nothing to do.

**First admin.** Roles live in `staff_members`; the app grants roles only through an existing admin,
so the first one is made by hand. Sign up in the app (or on the dev site), then in the dashboard's
SQL editor:

```sql
insert into staff_members (account_id, role)
select id, 'admin' from accounts where email = 'artur@example.com'
on conflict do nothing;
```

**Auth emails.** Supabase's built-in mailer only delivers to members of your Supabase organisation
and is rate-limited, so test families never receive confirmation mail. Pick one for dev:
Authentication → Providers → Email → **Confirm email off** (dev only; fastest), or custom SMTP
through Resend now (Authentication → SMTP Settings: host `smtp.resend.com`, port 465, user `resend`,
password = the Resend API key), which production needs anyway.

Then in the dashboard, **Authentication → URL Configuration**:

- Site URL: the dev site URL (from step 3; `http://localhost:5173` until then).
- Redirect URLs: add `http://localhost:5173/auth/callback` and, after step 3,
  `https://<dev site url>/auth/callback`. Sign-up confirmation emails redirect here.
- Keep email confirmations on (that is what `supabase/config.toml` assumes locally).

The **secret key** (`sb_secret_…`, Settings → API Keys — it is the service role) is in
`.env.local` as `SUPABASE_SECRET_KEY`; the deployed worker needs it from phase 5/7 via
`pnpm cf secret put` — never into git.

Free-plan note (decision J): the dev project pauses after 7 idle days; restore it from the
dashboard. Production must be on Pro before phase 5 — Free has no backups.

## 3. Cloudflare — dev worker

You have more than one Cloudflare account. `pnpm cf` is wrangler scoped to **this repo's**
account: its login state lives in `.wrangler/home` (gitignored) and it never reads the
machine-wide wrangler login or a `CLOUDFLARE_API_TOKEN` exported in your shell — so the other
account stays exactly as it is.

The account is recorded in `config/dev.yaml` (`cloudflare.account_id`); the wrapper passes it to
wrangler. Authenticate for **that** account one of two ways:

- **Token** (dash.cloudflare.com → My Profile → API Tokens → Create Token → "Edit Cloudflare Workers"
  template, account = the recorded one): put it in `.env.local` as `CLOUDFLARE_API_TOKEN`. Cloudflare
  tokens are 40 bare characters — an `sbp_…` value is a Supabase token, not a Cloudflare one.
- **Login:** `pnpm cf login` opens the browser once; state lands in `.wrangler/home`.

**The token, exactly.** dash.cloudflare.com → My Profile → API Tokens → Create Token → Create Custom
Token. Name it `momentum-tennis-wrangler-<machine>`. Cloudflare cannot scope a token to one Worker —
the account is the unit — so this one token serves dev now and prod later; dev/prod separation is
`--env` plus `config/prod.yaml` staying TODO until the production worker exists.

| scope | permission | level | why |
|---|---|---|---|
| Account | Workers Scripts | Edit | deploy both workers (script, static assets, cron triggers, secrets); attaching a custom domain uses this same permission |
| Account | Workers KV Storage | Edit | kept for later: edge cache of public schedule reads and rate-limit counters — never authoritative data |
| Account | Account Settings | Read | lets wrangler verify the account (`pnpm cf whoami`) |
| Account | Workers Tail | Read | `pnpm cf tail --env dev` for live logs |
| Zone | Zone | Read | resolves the zone when `app.momentum-tennis.com` is attached at launch |
| Zone | Workers Routes | Edit | only if production ever deploys on a route instead of a custom domain; harmless now |

Leave out everything else: R2 / D1 / Queues / AI (unused), DNS (custom domains are
created through the Workers endpoint, which issues the DNS records and certificate itself), Access
(configure it in the dashboard), any Edit on Account Settings.

- **Account Resources:** Include → Specific account → the Momentum Tennis account
  (`cloudflare.account_id` in `config/dev.yaml`). Never "All accounts" — the other account must
  stay out of reach.
- **Zone Resources:** Include → All zones from an account → the same account. The
  `momentum-tennis.com` zone does not exist yet; this covers it when it does, without re-issuing.
- **Client IP filtering:** empty (a laptop's address changes). **TTL:** set an end date about a
  year out and diary it; wrangler fails loudly when it expires.

The secret is shown once and starts with `cfut_`; put it in `.env.local` as `CLOUDFLARE_API_TOKEN`.
`CLOUDFLARE_ACCOUNT_ID` is not needed — the wrapper supplies the profile's.

```bash
pnpm cf whoami                # must show the recorded account, and only it
```

**Account-level prerequisites** (dashboard, one-time, no token involved):

| resource | needed for | where |
|---|---|---|
| `workers.dev` subdomain | the dev worker's URL `https://momentum-tennis-dev.<subdomain>.workers.dev` — register it **before** the first deploy | Workers & Pages → Overview → Your subdomain |
| Workers plan | Free is enough for dev; production needs **Workers Paid** (the Free plan's daily request cap is a hard stop) | Workers & Pages → Plans |
| Workers Builds git connection | `deploy/dev` deploying itself; Cloudflare generates its own API token for builds — none of yours | Workers & Pages → the worker → Settings → Builds |
| Zero Trust organisation | Access protection on the dev host (free tier) | Zero Trust → Access → Applications |
| `momentum-tennis.com` zone | the production custom domain `app.momentum-tennis.com` — the zone must be on Cloudflare (nameservers at GoDaddy → Cloudflare; the root keeps pointing at the legacy site by DNS record, decision J) | Add a site |

**First deploy, by hand** (creates the worker):

```bash
pnpm build:dev                # bakes .env.development's public values, NODE_ENV=production
pnpm cf deploy --env dev      # → prints https://momentum-tennis-dev.<subdomain>.workers.dev
```

Take that URL and:

1. put it in `config/dev.yaml` under `deploy.site_url`, then `pnpm build:dev && pnpm cf deploy --env dev`
   once more so the app knows its own origin (auth redirects and email links depend on it);
2. add `<url>/auth/callback` to Supabase's redirect URLs (step 2).

**Connect the repository** so `deploy/dev` deploys itself — dashboard: Workers & Pages →
`momentum-tennis-dev` → Settings → Builds → connect `pronei/momentum-tennis`:

| setting | value |
|---|---|
| Production branch | `deploy/dev` |
| Build command | `pnpm build:dev` |
| Deploy command | `npx wrangler deploy --env dev` |

(Cloudflare's build environment authenticates itself; the wrapper is only for your machine.)

**Protect it** — Zero Trust → Access → Applications → Self-hosted → the workers.dev hostname,
allow your email(s). Half-built booking flows should not be on the public internet.

**Secrets** (each only when its phase lands — the app runs without them; the endpoints that
need one answer 503 until it is set):

```bash
pnpm cf secret put SUPABASE_SECRET_KEY --env dev       # phase 5/7 — the sb_secret_… key
pnpm cf secret put STRIPE_SECRET_KEY --env dev         # phase 5 (sk_test_…)
pnpm cf secret put STRIPE_WEBHOOK_SECRET --env dev     # phase 5 (from the Stripe webhook endpoint you create for this URL)
pnpm cf secret put RESEND_API_KEY --env dev            # phase 4/7
pnpm cf secret put CRON_SHARED_SECRET --env dev        # phase 7 — generate: openssl rand -base64 32
```

## 4. Cloudflare — live worker (later)

Same steps with `--env live`, `pnpm build:live`, branch `deploy/live`, the production Supabase
project on Pro, no Access protection, and a custom domain: `app.momentum-tennis.com` first
(the legacy GoDaddy site keeps the root until the new site replaces it — decision J).

## 5. Cron worker (phase 7)

```bash
pnpm cf secret put CRON_SHARED_SECRET --env dev --config workers/cron/wrangler.toml   # the same value the app holds
pnpm cf deploy --env dev --config workers/cron/wrangler.toml                          # APP_URL comes from that file
```

## 6. Verify after each step

```bash
pnpm env:check                # profiles agree; what is still TODO
pnpm build:dev && pnpm preview   # then pnpm test:e2e — runs the smoke suite against the dev Supabase
```

## 7. Readiness by phase — what the operator must have done before each phase can be exercised on dev

Code gates never wait on these; the "deliverable on the dev deployment" half of a phase's gate does.

| before | needed | where |
|---|---|---|
| phase 3 | first admin on dev (SQL above); auth emails decided (confirm-email off in dev, or Resend SMTP); Cloudflare token or login for the recorded account → first deploy → `deploy.site_url` → redeploy; `<site>/auth/callback` in Supabase redirect URLs; Access protection on the dev host | §2, §3 |
| phase 4 | nothing new — credits are admin-granted; a few test families signed up on dev | — |
| phase 5 | Stripe **test** secret key and a webhook endpoint for `https://<dev site>/api/stripe/webhook` (its signing secret) as Cloudflare secrets; payment methods enabled in Stripe (ACH Direct Debit activation, Apple Pay domain registration, Cash App Pay, Link); refund wording and tax stance from Artur/accountant (decision E); production Supabase project on **Pro, standard Postgres** before anything goes live (decision J) | §3, Stripe dashboard |
| phase 6 | nothing | — |
| phase 7 | Resend account, verified sending domain (DNS at GoDaddy), API key → `RESEND_API_KEY`; `CRON_SHARED_SECRET` in the app and the cron worker; cron worker deployed; marketing/unsubscribe copy from legal | §3, §5 |
| launch | production Supabase (Pro, standard Postgres) with the GitHub integration on `deploy/live` and `SUPABASE_DB_PASSWORD_PROD` set; production worker + `app.momentum-tennis.com`; live Stripe keys and webhook; waiver text, privacy policy and terms from legal; Access removed from live | §4 |

Unrelated but pending: delete the unused `SUPABASE_PROJECT_REF_DEV` repository secret; revoke the
Supabase personal access token that was pasted into chat (dashboard → Account → Access Tokens) if it
is not in use elsewhere.

## Local development

```bash
cp .env.example .env.local    # fill only what you have; the app demands each secret lazily
pnpm dev                      # uses .env.development → the dev Supabase project
```

Never point local work at production. Never put real family data in dev.
