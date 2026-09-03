# Operations runbook — what the operator does, in order

Everything a developer can do is done by CI and the scripts. This is the rest: the accounts,
secrets and one-time links only a person with the right logins can create. Start with
`pnpm env:check` — it prints, per environment, what is still unconfigured.

The repository is **public under AGPL-3.0** (the LICENSE from the initial commit). Nothing
secret is in it by construction: `pnpm env:check` refuses a secret in a committed file, and the
design system's photo originals are gitignored. The publishable Supabase key in
`.env.development` is public by design — RLS is the guard.

## 0. Layout

| environment | branch        | Cloudflare worker    | Supabase project                | Stripe |
|-------------|---------------|----------------------|---------------------------------|--------|
| dev         | `deploy/dev`  | `momentumtennis-dev` | `rjiagjfvsaaxezsxfuzq` (Free)   | test   |
| live        | `deploy/live` | `momentumtennis`     | to be created (Pro before ph. 5) | live   |

Profiles: `config/dev.yaml`, `config/prod.yaml`. Flow: work → `main` → `deploy/dev` → `deploy/live`.

## 1. GitHub

- Remote: `git@github.com:pronei/momentum-tennis.git`. Default branch `main`.
- CI (`.github/workflows/ci.yml`) runs on every push and PR: env:check, types current, check,
  lint, test, build. Nothing to configure.
- Migrations (`.github/workflows/migrate.yml`) run on push to `deploy/dev` / `deploy/live` when
  `supabase/` changes. They need **repository secrets** (Settings → Secrets and variables →
  Actions):

  | secret | where it comes from |
  |---|---|
  | `SUPABASE_ACCESS_TOKEN` | supabase.com/dashboard/account/tokens — a personal access token for the account that owns the projects |
  | `SUPABASE_PROJECT_REF_DEV` | `rjiagjfvsaaxezsxfuzq` |
  | `SUPABASE_DB_PASSWORD_DEV` | dashboard → project → Settings → Database (reset it there if unknown) |
  | `SUPABASE_PROJECT_REF_LIVE`, `SUPABASE_DB_PASSWORD_LIVE` | when the production project exists |

  Until those exist, apply migrations from your machine (step 2). The first push of a branch may
  not trigger the path-filtered workflow at all — do the first `db push` by hand regardless.

## 2. Supabase — dev project (do this first; nothing works until the schema is applied)

The CLI is installed (`supabase --version`). The Supabase MCP in this workspace belongs to a
different account, so use the CLI or the dashboard only.

```bash
supabase login                                         # opens the browser — pick the account that owns rjiagjfvsaaxezsxfuzq
supabase link --project-ref rjiagjfvsaaxezsxfuzq       # asks for the database password (dashboard → Settings → Database)
supabase db push                                       # applies supabase/migrations 0001…0005 in order
```

Verify the schema landed (this returns the six ball levels once it has):

```bash
curl -s "https://rjiagjfvsaaxezsxfuzq.supabase.co/rest/v1/skill_levels?select=key,rank&order=rank" \
  -H "apikey: $(grep PUBLIC_SUPABASE_PUBLISHABLE_KEY .env.development | cut -d= -f2)"
```

Then in the dashboard, **Authentication → URL Configuration**:

- Site URL: the dev site URL (from step 3; `http://localhost:5173` until then).
- Redirect URLs: add `http://localhost:5173/auth/callback` and, after step 3,
  `https://<dev site url>/auth/callback`. Sign-up confirmation emails redirect here.
- Keep email confirmations on (that is what `supabase/config.toml` assumes locally).

The **service role key** (Settings → API) is not needed until phase 5/7. When it is, it goes
into `.env.local` locally and `wrangler secret put` deployed — never into git.

Free-plan note (decision J): the dev project pauses after 7 idle days; restore it from the
dashboard. Production must be on Pro before phase 5 — Free has no backups.

## 3. Cloudflare — dev worker

You have more than one Cloudflare account, and the Cloudflare MCP in this workspace is for
another one. Use wrangler, and confirm the account every time:

```bash
npx wrangler whoami                     # is this the account Momentum Tennis should live in?
npx wrangler logout && npx wrangler login   # if not
```

Put the confirmed account id in `config/dev.yaml` (`cloudflare.account_id`) so it is on record.

**First deploy, by hand** (creates the worker):

```bash
pnpm build:dev                          # bakes .env.development's public values, NODE_ENV=production
npx wrangler deploy --env dev           # → prints https://momentumtennis-dev.<subdomain>.workers.dev
```

Take that URL and:

1. put it in `config/dev.yaml` under `deploy.site_url`, then `pnpm build:dev && npx wrangler deploy --env dev`
   once more so the app knows its own origin (auth redirects and email links depend on it);
2. add `<url>/auth/callback` to Supabase's redirect URLs (step 2).

**Connect the repository** so `deploy/dev` deploys itself — dashboard: Workers & Pages →
`momentumtennis-dev` → Settings → Builds → connect `pronei/momentum-tennis`:

| setting | value |
|---|---|
| Production branch | `deploy/dev` |
| Build command | `pnpm build:dev` |
| Deploy command | `npx wrangler deploy --env dev` |

**Protect it** — Zero Trust → Access → Applications → Self-hosted → the workers.dev hostname,
allow your email(s). Half-built booking flows should not be on the public internet.

**Secrets** (each only when its phase lands — the app runs without them; the endpoints that
need one answer 503 until it is set):

```bash
npx wrangler secret put SUPABASE_SERVICE_ROLE_KEY --env dev   # phase 5/7
npx wrangler secret put STRIPE_SECRET_KEY --env dev           # phase 5 (sk_test_…)
npx wrangler secret put STRIPE_WEBHOOK_SECRET --env dev       # phase 5 (from the Stripe webhook endpoint you create for this URL)
npx wrangler secret put RESEND_API_KEY --env dev              # phase 4/7
npx wrangler secret put CRON_SHARED_SECRET --env dev          # phase 7 — generate: openssl rand -base64 32
```

## 4. Cloudflare — live worker (later)

Same steps with `--env live`, `pnpm build:live`, branch `deploy/live`, the production Supabase
project on Pro, no Access protection, and a custom domain: `app.momentum-tennis.com` first
(the legacy GoDaddy site keeps the root until the new site replaces it — decision J).

## 5. Cron worker (phase 7)

```bash
cd workers/cron
npx wrangler secret put CRON_SHARED_SECRET --env dev          # the same value the app holds
npx wrangler deploy --env dev                                 # APP_URL comes from workers/cron/wrangler.toml
```

## 6. Verify after each step

```bash
pnpm env:check                          # profiles agree; what is still TODO
pnpm build:dev && pnpm preview          # then pnpm test:e2e — runs the smoke suite against the dev Supabase
```

## Local development

```bash
cp .env.example .env.local              # optional until a phase needs a secret
pnpm dev                                # uses .env.development → the dev Supabase project
```

Never point local work at production. Never put real family data in dev.
