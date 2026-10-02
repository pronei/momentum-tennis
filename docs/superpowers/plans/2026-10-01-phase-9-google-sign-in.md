# Phase 9 — Sign in with Google — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A family creates an account or logs in with "Continue with Google" on the login and signup pages — without JavaScript — and the account starts with their name; email and password keep working.

**Architecture:** Supabase Auth does the OAuth. The Google client id and secret live in the Supabase dashboard, so the app holds no new secret. A form POST to `/auth/google` asks Supabase for Google's consent URL on the server (`signInWithOAuth`); `@supabase/ssr` runs the PKCE flow and stores the code verifier in a cookie on that response, and the existing `/auth/callback` already exchanges the returned code for a session. Migration 0010 makes a new account take the name its sign-up already knows — Google's `full_name` / `name`, or the name typed at email sign-up, both of which 0001's trigger drops today. The button is Google's own artwork, a recorded design-system exception.

**Tech Stack:** No new dependencies. Supabase Auth (Google provider), `@supabase/ssr` PKCE, a SvelteKit `+server.ts` POST endpoint, vitest, the PGlite harness, Playwright.

**Branch:** `phase-9/google-sign-in` from `main`. **Migration:** `0010_account_name.sql`. **Harness:** section 16. Phase 9 runs before phases 6 and 7, so their plans now say harness sections 17 and 18 (renumbered 2026-10-01).

---

## Decisions

**Answered by the user 2026-10-01:**

1. **Google only**, beside email and password. Apple would cost $99 a year (Apple Developer Program), needs a new client secret every 6 months, sends the user's name only on the first sign-in, and may hand over a private relay address that receipts and reminders must be registered to reach ([source](https://supabase.com/docs/guides/auth/social-login/auth-apple)). It can follow if families ask.
2. **Google's official button artwork**, unmodified, inside our own form button. Google's guidelines require the full-colour "G" on a white, light, dark or neutral ground and the text in Google Sans; a text-only button is not allowed ([source](https://developers.google.com/identity/branding-guidelines)). The artwork is the one place the G or Google Sans appears, recorded in `design-system/readme.md` under Iconography, as the PhotoSwipe dependency is.
3. **Built now, before phase 6.** Google sign-in needs no email. Until phase 7 sets up Resend, Supabase's built-in mailer reaches only members of the Supabase organisation, so an email sign-up from outside confirms only where confirmation is switched off.

**Defaults that stand until the user says otherwise:**

4. **Email and password stay.** Google is an addition.
5. **Accounts link by verified email, as Supabase does it.** A new Google identity with the same email as an existing user joins that user; Supabase "will remove any other unconfirmed identities linked to an existing user", which is what stops pre-account takeover ([source](https://supabase.com/docs/guides/auth/auth-identity-linking)). So a family that signed up by email and confirmed keeps one account and gains a second way in. An email sign-up that was never confirmed keeps its account row, loses its password, and Google becomes its way in; the name typed at that sign-up stays on the account, and the family can change it on the account page. A different email is a different account; manual linking (`linkIdentity`) is not built.
6. **Where it lands.** Continue with Google from `/signup` lands on `/portal/account`, as an email sign-up's confirmation link does, so the family adds a phone number; from `/login` it lands on the login page's `next`.
7. **Default scopes only** — `openid`, `userinfo.email`, `userinfo.profile` ([source](https://supabase.com/docs/guides/auth/social-login/auth-google)). These are basic scopes: no Google security review.
8. **The consent screen on dev** stays in Google's *Testing* status (only listed Google accounts can sign in) and names `rjiagjfvsaaxezsxfuzq.supabase.co`, which Supabase itself says "does not inspire trust". Before launch: Supabase's custom domain add-on ($10 a month, paid plans — production is on Pro per decision J) so the screen and callback read `auth.momentum-tennis.com` ([source](https://supabase.com/docs/guides/platform/custom-domains), [price](https://supabase.com/docs/guides/platform/manage-your-usage/custom-domains)), and Google brand verification to show the academy's name and logo, which needs the domain verified in Search Console and a privacy policy on that domain — legal's ([source](https://developers.google.com/identity/protocols/oauth2/production-readiness/brand-verification)).
9. **Minors: no new path.** Whatever an email sign-up may do, a Google sign-up may do, and nothing more; question O (a child's own login) stays open.
10. **Redirect URLs use `**`.** The callback carries `?next=…&via=google`, and Supabase matches redirect URLs as globs where `**` "matches any sequence of characters" ([source](https://supabase.com/docs/guides/auth/redirect-urls)). Allow-listing `…/auth/callback**` also covers the email confirmation link, which already carries `?next=`.

---

## File structure

**Migration & harness**
- Create `supabase/migrations/0010_account_name.sql` — `handle_new_auth_user()` copies the name.
- Modify `supabase/tests/validate.mjs` — the `auth.users` stub gains `raw_user_meta_data jsonb` (as Supabase's has); section 16.
- Modify `scripts/gen-db-types.mjs` — the same stub column, so the two stubs stay one shape.

**Server**
- Create `src/lib/server/auth/oauth.ts` (+ `oauth.test.ts`) — `startGoogleSignIn`.
- Create `src/lib/server/auth/notices.ts` (+ `notices.test.ts`) — `loginNotice`, the copy for `?error=`.
- Create `src/routes/auth/google/+server.ts` — the POST that starts the flow.
- Modify `src/routes/auth/callback/+server.ts` — a provider error goes to `/login?error=oauth` or `link`.
- Modify `src/routes/(auth)/login/+page.server.ts` — `notice` and `next` in the load.

**UI**
- Create `static/brand/google-continue.svg` — Google's artwork, unmodified.
- Create `src/lib/components/GoogleButton.svelte`; modify `src/lib/components/components.test.ts`.
- Modify `src/routes/(auth)/login/+page.svelte`, `src/routes/(auth)/signup/+page.svelte`.
- Modify `design-system/readme.md` — the exception.

**Tests & docs**
- Modify `e2e/smoke.test.ts`.
- Modify `docs/OPERATIONS.md` (§2 Sign in with Google, a §4 line for the live project, §7 phase-9 row), `AGENTS.md`, `docs/PLAN.md`, `docs/HANDOFF-opus5.md`; create the phase checklist.

---

### Task 1: Migration 0010 and harness §16 — the account takes the name its sign-up knows

**Files:** Modify `supabase/tests/validate.mjs`, `scripts/gen-db-types.mjs`; create `supabase/migrations/0010_account_name.sql`.

- [ ] **Step 1: Widen both auth stubs.** In `supabase/tests/validate.mjs` (the "Supabase-shaped harness" block) and `scripts/gen-db-types.mjs`, change

```js
  create table auth.users (id uuid primary key, email text);
```

to

```js
  create table auth.users (id uuid primary key, email text, raw_user_meta_data jsonb);
```

The harness's own `insert into auth.users values ($1,$2)` keeps working: Postgres fills the trailing column with its default.

- [ ] **Step 2: Failing section 16.** Append before the final summary line (`console.log(failures ? …`) of `validate.mjs`. Like section 15's `p5` names, this section's names carry `p9`; the role is already reset there, and the trigger is SECURITY DEFINER either way.

```js
console.log('16. a new account takes the name its sign-up already knows (0010)');
const [P9G, P9N, P9T, P9X, P9L] = [1, 2, 3, 4, 5].map(
	(n) => `00000000-0000-4000-8000-00000000090${n}`
);
await q(
	`insert into auth.users (id, email, raw_user_meta_data) values
	   ($1, 'google@x', '{"full_name":"Priya Raman","name":"Priya R."}'),
	   ($2, 'named@x',  '{"name":"Sam Lee"}'),
	   ($3, 'typed@x',  '{"full_name":"  Dana Cho  "}'),
	   ($4, 'none@x',   null),
	   ($5, 'long@x',   $6::jsonb)`,
	[P9G, P9N, P9T, P9X, P9L, JSON.stringify({ full_name: 'x'.repeat(200) })]
);
const p9names = Object.fromEntries(
	(
		await q(`select id, full_name from accounts where id in ($1, $2, $3, $4, $5)`, [
			P9G,
			P9N,
			P9T,
			P9X,
			P9L
		])
	).rows.map((r) => [r.id, r.full_name])
);
if (
	p9names[P9G] === 'Priya Raman' &&
	p9names[P9N] === 'Sam Lee' &&
	p9names[P9T] === 'Dana Cho' &&
	p9names[P9X] === '' &&
	p9names[P9L] === 'x'.repeat(120)
)
	ok('full_name, else name, trimmed and cut to the 120 the account form accepts, else empty');
else {
	console.log('  ✗ names', p9names);
	failures++;
}
```

- [ ] **Step 3: Run** `pnpm db:test` → FAIL: the names are all `''` (0001's trigger copies only the email).
- [ ] **Step 4: Migration.** Create `supabase/migrations/0010_account_name.sql`:

```sql
-- 0010 — a new account takes the name its sign-up already knows.
-- Email sign-up puts the typed name in the user's metadata as full_name; Google supplies full_name
-- and name. 0001's trigger copied only the email, so every account began nameless and the family
-- typed their name twice. Trimmed, and cut to the 120 characters the account form accepts.
create or replace function public.handle_new_auth_user() returns trigger
  language plpgsql security definer set search_path = public as $$
begin
  insert into public.accounts (id, email, full_name)
  values (
    new.id,
    coalesce(new.email, ''),
    left(coalesce(nullif(trim(new.raw_user_meta_data->>'full_name'), ''),
                  nullif(trim(new.raw_user_meta_data->>'name'), ''),
                  ''), 120)
  )
  on conflict (id) do nothing;
  return new;
end $$;
```

- [ ] **Step 5: Run** `pnpm db:test` → `ALL CHECKS PASSED`, section 16 included. `pnpm db:types` → no diff (the function's signature is unchanged).
- [ ] **Step 6: Commit** — `git commit -m "feat(db): 0010 — a new account takes the name its sign-up already knows; harness §16"`

### Task 2: `startGoogleSignIn`

**Files:** Create `src/lib/server/auth/oauth.ts`, `src/lib/server/auth/oauth.test.ts`.

- [ ] **Step 1: Failing test.** Create `oauth.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { startGoogleSignIn, type OAuthAuth } from './oauth';

/** The one call the function makes, recorded; the reply is Supabase's shape. */
function fakeAuth(reply: { url?: string; error?: string }) {
	const calls: unknown[] = [];
	const auth = {
		signInWithOAuth: async (args: unknown) => {
			calls.push(args);
			return reply.error
				? { data: { provider: 'google', url: null }, error: { message: reply.error } }
				: { data: { provider: 'google', url: reply.url ?? null }, error: null };
		}
	} as unknown as OAuthAuth;
	return { auth, calls };
}
const siteUrl = 'https://site.test';
const consent = 'https://ref.supabase.co/auth/v1/authorize?provider=google';

describe('startGoogleSignIn — the server asks Supabase for Google; Supabase holds the secret', () => {
	it('asks for Google, coming back to the callback with the next page and the way it came', async () => {
		const { auth, calls } = fakeAuth({ url: consent });
		const out = await startGoogleSignIn(auth, { siteUrl, next: '/portal/book' });
		expect(out).toEqual({ ok: true, value: { url: consent } });
		expect(calls).toEqual([
			{
				provider: 'google',
				options: { redirectTo: 'https://site.test/auth/callback?next=%2Fportal%2Fbook&via=google' }
			}
		]);
	});

	it('never lets next leave the site', async () => {
		const { auth, calls } = fakeAuth({ url: consent });
		await startGoogleSignIn(auth, { siteUrl, next: '//evil.example' });
		expect(calls[0]).toMatchObject({
			options: { redirectTo: 'https://site.test/auth/callback?next=%2Fportal&via=google' }
		});
	});

	it('a refusal, or no consent url, is an error — never a redirect to nowhere', async () => {
		const refused = fakeAuth({ error: 'storage unavailable' });
		expect((await startGoogleSignIn(refused.auth, { siteUrl, next: null })).ok).toBe(false);
		const empty = fakeAuth({});
		expect((await startGoogleSignIn(empty.auth, { siteUrl, next: null })).ok).toBe(false);
	});
});
```

- [ ] **Step 2: Run** `pnpm vitest run src/lib/server/auth/oauth.test.ts` → FAIL (module missing).
- [ ] **Step 3: Implement** `oauth.ts`:

```ts
import type { SupabaseClient } from '@supabase/supabase-js';
import { AppError, err, ok, type Result } from '$lib/server/domain/result';
import { safeRedirectPath } from './redirect';

// Google sign-in, started on the server. The client id and secret live in the Supabase dashboard,
// not here: this only asks Supabase for Google's consent URL. @supabase/ssr runs the PKCE flow
// and stores the code verifier in a cookie on this response, so /auth/callback can finish it.
// `via=google` lets the callback tell a cancelled Google consent from an expired email link —
// Supabase reports both as error=access_denied.

export type OAuthAuth = Pick<SupabaseClient['auth'], 'signInWithOAuth'>;

export async function startGoogleSignIn(
	auth: OAuthAuth,
	opts: { siteUrl: string; next: string | null }
): Promise<Result<{ url: string }>> {
	const next = encodeURIComponent(safeRedirectPath(opts.next));
	const { data, error } = await auth.signInWithOAuth({
		provider: 'google',
		options: { redirectTo: `${opts.siteUrl}/auth/callback?next=${next}&via=google` }
	});
	if (error || !data.url)
		return err(new AppError('unexpected', error?.message ?? 'no consent url'));
	return ok({ url: data.url });
}
```

- [ ] **Step 4: Run** → PASS. `pnpm check` → 0/0.
- [ ] **Step 5: Commit** — `git commit -m "feat(auth): startGoogleSignIn asks Supabase for Google's consent url"`

### Task 3: Login notices, and the callback's error path

**Files:** Create `src/lib/server/auth/notices.ts`, `notices.test.ts`; modify `src/routes/auth/callback/+server.ts`, `src/routes/(auth)/login/+page.server.ts`, `src/routes/(auth)/login/+page.svelte`.

- [ ] **Step 1: Failing test.** `notices.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { loginNotice } from './notices';

describe('loginNotice — what the login page says after a link or a Google sign-in fails', () => {
	it('explains an expired link and an unfinished Google sign-in', () => {
		expect(loginNotice('link')).toContain('expired or was already used');
		expect(loginNotice('oauth')).toContain('Signing in with Google did not finish');
	});

	it('says nothing for a missing or unknown code, and never echoes the query', () => {
		expect(loginNotice(null)).toBeNull();
		expect(loginNotice('<script>')).toBeNull();
		expect(loginNotice('constructor')).toBeNull();
	});
});
```

- [ ] **Step 2: Run** → FAIL. **Step 3: Implement** `notices.ts`:

```ts
// The login page's explanations for ?error=…, in one place. An unknown code says nothing rather
// than echo whatever the query held. No exclamation points (the design system's voice).
const NOTICES: Record<string, string> = {
	link: 'That link has expired or was already used. Log in below, or sign up again for a new one.',
	oauth: 'Signing in with Google did not finish. Try again, or use your email and password.'
};

export const loginNotice = (code: string | null): string | null =>
	code !== null && Object.hasOwn(NOTICES, code) ? NOTICES[code] : null;
```

- [ ] **Step 4: Callback.** In `src/routes/auth/callback/+server.ts`, replace the handler's last line, `redirect(303, '/login?error=link');`, with:

```ts
	// No code, or it would not exchange: a cancelled Google consent, a lost verifier cookie, or an
	// expired email link. Supabase reports the first and the last alike (error=access_denied, kept
	// in the query beside our own parameters); `via=google` (startGoogleSignIn) tells them apart.
	redirect(303, url.searchParams.get('via') === 'google' ? '/login?error=oauth' : '/login?error=link');
```

  and update its doc comment to `/** Email confirmation, magic link and Google sign-in landing: exchange the code for a session, then continue. */`. The exchange itself is unchanged: Google's code arrives as `?code=` exactly as an email link's does.
- [ ] **Step 5: Login load.** In `src/routes/(auth)/login/+page.server.ts`, import `loginNotice` from `$lib/server/auth/notices` and return:

```ts
	return {
		form: await superValidate(zod4(loginSchema)),
		notice: loginNotice(url.searchParams.get('error')),
		next: safeRedirectPath(url.searchParams.get('next'))
	};
```

- [ ] **Step 6: Login page.** In `src/routes/(auth)/login/+page.svelte`, directly under the `<h1>`:

```svelte
	{#if data.notice}<Banner tone="error">{data.notice}</Banner>{/if}
```

- [ ] **Step 7: Run** `pnpm vitest run src/lib/server/auth` → PASS; `pnpm check` → 0/0.
- [ ] **Step 8: Commit** — `git commit -m "feat(auth): the login page explains a failed link or an unfinished Google sign-in"`

### Task 4: `/auth/google` — the POST that starts the flow

**Files:** Create `src/routes/auth/google/+server.ts`.

- [ ] **Step 1: Implement** (its behaviour is proven end to end in Task 6, where the redirect and the PKCE cookie are observable):

```ts
import { redirect } from '@sveltejs/kit';
import { startGoogleSignIn } from '$lib/server/auth/oauth';
import { getConfig } from '$lib/server/config.runtime';
import type { RequestHandler } from './$types';

/**
 * "Continue with Google". A form POST, so it works without JavaScript and SvelteKit's origin check
 * applies; the PKCE verifier cookie @supabase/ssr sets travels with the 303 to Google.
 */
export const POST: RequestHandler = async ({ request, locals }) => {
	const form = await request.formData();
	const started = await startGoogleSignIn(locals.supabase.auth, {
		siteUrl: getConfig().siteUrl,
		next: String(form.get('next') ?? '')
	});
	if (!started.ok) redirect(303, '/login?error=oauth');
	redirect(303, started.value.url);
};
```

- [ ] **Step 2: Run** `pnpm check` and `pnpm lint` → clean. **Step 3: Commit** — `git commit -m "feat(auth): /auth/google starts Google sign-in from a form post"`

### Task 5: The button — Google's artwork, the pages, the recorded exception

**Files:** Create `static/brand/google-continue.svg`, `src/lib/components/GoogleButton.svelte`; modify `src/lib/components/components.test.ts`, the login and signup pages, `design-system/readme.md`.

- [ ] **Step 1: The artwork.** Downloading is an explicit-permission action: ask the user first, naming the file and its source. Then, from [Google's branding guidelines](https://developers.google.com/identity/branding-guidelines), download the button assets and take the web SVG in the light theme, pill shape, "Continue with Google" variant (in Google's pack, `web_light_rd_ctn.svg`). Save it as `static/brand/google-continue.svg`, unmodified — Google's rules forbid changing the logo's size or colour. Check that its lettering is drawn as paths: a `<text>` element would render in whatever font the browser has, not Google's. If the SVG has one, take the pack's PNG of the same variant at 2× instead (`google-continue.png`, `height="40"`).
- [ ] **Step 2: Failing SSR test.** Append to `components.test.ts` (import `GoogleButton from './GoogleButton.svelte'`):

```ts
describe('GoogleButton — Google’s artwork in a form that starts the flow on the server', () => {
	it('posts the next page to /auth/google, with Google’s artwork as its label', () => {
		const out = html(GoogleButton, { next: '/portal/book' });
		expect(out).toContain('method="POST"');
		expect(out).toContain('action="/auth/google"');
		expect(out).toContain('name="next"');
		expect(out).toContain('value="/portal/book"');
		expect(out).toMatch(/<button[^>]*type="submit"/);
		expect(out).toContain('src="/brand/google-continue.svg"');
		expect(out).toContain('alt="Continue with Google"');
	});

	it('goes to the portal unless told otherwise', () => {
		expect(html(GoogleButton, {})).toContain('value="/portal"');
	});
});
```

- [ ] **Step 3: Run** → FAIL. **Step 4: Implement** `GoogleButton.svelte`:

```svelte
<script lang="ts">
	/* "Continue with Google": Google's own button artwork, unmodified — its branding rules fix the
	   G logo, its colours and the Google Sans lettering — inside our form, so the flow starts on
	   the server and works without JavaScript. The one place either appears (design-system
	   readme, Iconography). Never amber: the page's one primary action stays ours. */
	let { next = '/portal' }: { next?: string } = $props();
</script>

<form class="gb" method="POST" action="/auth/google">
	<input type="hidden" name="next" value={next} />
	<button class="gb__button" type="submit">
		<img class="gb__img" src="/brand/google-continue.svg" alt="Continue with Google" height="40" />
	</button>
</form>

<style>
	.gb {
		display: flex;
	}
	.gb__button {
		display: inline-flex;
		align-items: center;
		min-height: var(--size-action);
		padding: 0;
		border: 0;
		background: none;
		cursor: pointer;
	}
	.gb__img {
		display: block;
		width: auto;
	}
</style>
```

- [ ] **Step 5: The pages.** In `src/routes/(auth)/login/+page.svelte`, immediately before the email `<form>` (after both banners):

```svelte
	<GoogleButton next={data.next} />
	<p class="auth__or">Or with your email</p>
```

  In `src/routes/(auth)/signup/+page.svelte`, after the lede and before the form: `<GoogleButton next="/portal/account" />` and the same `auth__or` line. Import `GoogleButton from '$lib/components/GoogleButton.svelte'` in both. Add to both pages' styles:

```css
	.auth__or {
		margin: 0;
		font-family: var(--font-mono);
		font-size: var(--size-label-sm);
		letter-spacing: 0.07em;
		text-transform: uppercase;
		color: var(--text-secondary);
	}
```

- [ ] **Step 6: The recorded exception.** In `design-system/readme.md`, under **Iconography** after the PhotoSwipe paragraph:

```markdown
**The one third-party mark in an action: Google's sign-in button** (adopted 2026-10-01, phase 9). Google's branding guidelines fix its full-colour G, the white ground and the Google Sans lettering, and forbid a text-only button, so "Continue with Google" is Google's own artwork, unmodified (`static/brand/google-continue.svg`), inside our form button (`src/lib/components/GoogleButton.svelte`). It is the only place the G or Google Sans appears, and it is never the page's amber action.
```

- [ ] **Step 7: Run** `pnpm vitest run src/lib/components` → PASS; `pnpm check`, `pnpm lint` → clean.
- [ ] **Step 8: Commit** — `git commit -m "feat(auth): Continue with Google on login and signup, Google's artwork as a recorded exception"`

### Task 6: e2e — the flow starts on the server, and a failure explains itself

**Files:** Modify `e2e/smoke.test.ts`.

- [ ] **Step 1: Add the tests.** They need no Google configuration: Supabase's client builds the consent URL itself, and the test stubs the request to it.

```ts
test('Continue with Google starts Google sign-in on the server, keeping next and the PKCE verifier', async ({
	page,
	context
}) => {
	await page.route('**/auth/v1/authorize**', (route) =>
		route.fulfill({ status: 200, contentType: 'text/plain', body: 'stub: Google consent' })
	);
	await page.goto('/login?next=/portal/book');
	await page.getByRole('button', { name: 'Continue with Google' }).click();
	await page.waitForURL(/\/auth\/v1\/authorize/);
	const consent = new URL(page.url());
	expect(consent.searchParams.get('provider')).toBe('google');
	const back = new URL(consent.searchParams.get('redirect_to') ?? '');
	expect(back.pathname).toBe('/auth/callback');
	expect(back.searchParams.get('next')).toBe('/portal/book');
	expect(back.searchParams.get('via')).toBe('google');
	expect((await context.cookies()).some((c) => c.name.endsWith('-code-verifier'))).toBe(true);

	await page.goto('/signup');
	await expect(page.getByRole('button', { name: 'Continue with Google' })).toBeVisible();
});

test('an unfinished Google sign-in, or an expired link, lands on login with a plain explanation', async ({
	page
}) => {
	await page.goto('/auth/callback?error=access_denied&via=google');
	await expect(page).toHaveURL(/\/login\?error=oauth$/);
	await expect(page.getByText('Signing in with Google did not finish')).toBeVisible();
	await page.goto('/auth/callback?error=access_denied&error_code=otp_expired');
	await expect(page).toHaveURL(/\/login\?error=link$/);
	await expect(page.getByText('expired or was already used')).toBeVisible();
});
```

- [ ] **Step 2: Run** `pnpm test:e2e -g "Google|unfinished"` → PASS. **Step 3: Commit** — `git commit -m "test(auth): Google sign-in starts on the server; failures explain themselves"`

### Task 7: Operator steps, records, finish

**Files:** Modify `docs/OPERATIONS.md`, `AGENTS.md`, `docs/PLAN.md`, `docs/HANDOFF-opus5.md`; create `docs/superpowers/plans/2026-10-01-phase-9-google-sign-in.checklist.md`.

- [ ] **Step 1: OPERATIONS §2, a "Sign in with Google" subsection** — the operator's steps, in order:
  1. In the Google Cloud console, with an academy-owned Google account: a project "Momentum Tennis"; **OAuth consent screen** → External, app name "Momentum Tennis", support email, default scopes only, publishing status **Testing**, and the test users who may sign in on dev (up to 100: the operator, Artur, test parents).
  2. **Credentials → Create OAuth client ID → Web application.** Authorized JavaScript origins: `https://momentum-tennis-dev.proneidev.workers.dev`, `http://localhost:5173`. Authorized redirect URI: `https://rjiagjfvsaaxezsxfuzq.supabase.co/auth/v1/callback`.
  3. Supabase (dev) → **Authentication → Sign In / Providers → Google**: enable it and paste the client id and secret. They live there — never in the repo, `.env.local` or the worker.
  4. Supabase → **Authentication → URL Configuration → Redirect URLs**: `https://momentum-tennis-dev.proneidev.workers.dev/auth/callback**` and `http://localhost:5173/auth/callback**`.
  5. Before launch, on the prod project: the custom domain add-on (`auth.momentum-tennis.com`, $10 a month) with its callback added to the Google client beside the project URL; brand verification (domain in Search Console, the privacy policy on momentum-tennis.com); publish the consent screen.

  And one line in §4 (live worker): steps 1–5 on the production Supabase project before a release carries the button to `deploy/live`.
- [ ] **Step 2: OPERATIONS §7** gains a phase-9 row: steps 1–4 to exercise it on dev; step 5 before launch.
- [ ] **Step 3: Records.** `AGENTS.md` — status (phase 9), the repo map (`auth/google`, `src/lib/server/auth/{oauth,notices}.ts`, `GoogleButton`), and under Prime directive 6: the Google client secret lives in Supabase, not the app. `docs/PLAN.md` — the phase-9 row and the decision-log entry. `docs/HANDOFF-opus5.md` — phase 9 done; phase 6 next. The checklist file.
- [ ] **Step 4: Gates** — `pnpm env:check` · `pnpm check` (0/0) · `pnpm lint` · `pnpm test` · `pnpm db:test` · `pnpm db:types` no diff · `pnpm build:dev` · `pnpm test:e2e`.
- [ ] **Step 5: Finish** — the operator's steps 1–4 come before the merge: until Google is enabled on the project, the button leads to Supabase's raw "provider is not enabled" reply. Then ask before the outward step; merge to `main`, fast-forward `deploy/dev`, push, confirm 0010 on the dev project. Sign in with a listed Google test account on dev and confirm the account carries the Google name; sign up by email and confirm the typed name arrives too. Report, **stop**. The prod project gets the same steps, and step 5, before a release carries the button to `deploy/live` — Step 1's line in OPERATIONS §4.

---

## Exit criterion

On dev, a family signs up and logs in with Google and the account starts with their name; email sign-up keeps working; the flow needs no JavaScript.

## Self-review

**Spec coverage.** OAuth sign-up and log-in → Tasks 2, 4, 5; the account's name → Task 1; the failure path → Task 3; the design-system conflict → Task 5's recorded exception (decision 2); proof → Task 6 (server start, PKCE cookie, `next`, both failure codes) plus the manual dev sign-in in Task 7, since a real Google consent cannot run in CI. Apple and manual linking are out of scope by decision 1 and default 5.

**Placeholders.** None: every code step carries its code; the artwork's file name is Google's, with the variant spelled out should the pack rename it.

**Type consistency.** `startGoogleSignIn(auth, { siteUrl, next })` returns `Result<{ url }>` (Task 2) and is what `/auth/google` calls (Task 4). `?via=google` is written by Task 2 and read by Task 3's callback and Task 6's tests. `loginNotice(code)` (Task 3) feeds the login load's `notice`, whose `next` the login page hands to `GoogleButton` (Task 5).
