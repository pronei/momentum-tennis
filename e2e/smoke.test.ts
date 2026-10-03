import { expect, test } from '@playwright/test';

test('home is the homepage kit inside the site shell, one amber action above the fold', async ({
	page
}) => {
	await page.goto('/');
	await expect(page.getByRole('navigation', { name: 'Primary' })).toBeVisible();
	await expect(page.getByRole('heading', { level: 1 })).toContainText('Learn to see');
	await expect(page.locator('#programs article')).toHaveCount(3);
	await expect(page.getByText(/^(ENROLLING NOW|RETURNS \d{4}|DATES COMING) · /)).toBeVisible();
	await expect(page.getByText('155', { exact: true })).toBeVisible();
	await expect(page.getByRole('region', { name: 'Partners' })).toBeVisible();
	await expect(page.getByText(/students aren’t improving/)).toBeVisible();
	await expect(page.getByRole('heading', { name: 'Book a free trial class.' })).toBeVisible();
	await expect(page.getByRole('contentinfo')).toBeVisible();
	const amberInView = await page.locator('.mt-btn--primary').evaluateAll((els) =>
		els
			.filter((e) => {
				const r = e.getBoundingClientRect();
				return r.width > 0 && r.bottom > 0 && r.top < window.innerHeight;
			})
			.map((e) => e.textContent?.trim())
	);
	expect(amberInView).toEqual(['Book a free trial class']);
	// the styleguide stays reachable at its own URL, but the home page no longer points at it
	await expect(page.locator('a[href="/styleguide"]')).toHaveCount(0);
});

test('styleguide renders every ported component group', async ({ page }) => {
	await page.goto('/styleguide');
	await expect(page.getByRole('heading', { name: 'Styleguide' })).toBeVisible();
	await expect(page.getByRole('radiogroup', { name: 'Visibility' })).toBeVisible();
	await expect(page.getByRole('navigation', { name: 'Pagination' })).toBeVisible();
	// phase 3: the admin table, the day grid, the session form and the two site timelines
	await expect(page.getByRole('columnheader', { name: 'Seats' })).toBeVisible();
	await expect(page.getByText('2026-09-12 · SATURDAY')).toBeVisible();
	await expect(page.getByRole('radiogroup', { name: 'Type' })).toBeVisible();
	await expect(page.getByText('Technical skill training')).toBeVisible();
	await expect(page.getByText('Chess & mental development')).toBeVisible();
	// phase 8: the brand and media ports
	await expect(page.getByRole('img', { name: /stroboscopic/i })).toBeVisible();
	await expect(page.getByText('Rallies & games — green ball')).toBeVisible();
});

test('the portal is guarded at the server: anonymous users land on login with next', async ({
	page
}) => {
	await page.goto('/portal/account');
	await expect(page).toHaveURL(/\/login\?next=%2Fportal%2Faccount/);
	await expect(page.getByLabel('Email')).toBeVisible();
	// phase 10: the scorecard composites
	await expect(page.getByLabel('Momentum player')).toBeVisible();
});

test('admin is refused, not hidden, for anonymous users', async ({ page }) => {
	const res = await page.goto('/admin');
	expect(res?.url()).toMatch(/\/login/);
});

test('the player roster is guarded at the server, like the rest of the portal', async ({
	page
}) => {
	await page.goto('/portal/players');
	await expect(page).toHaveURL(/\/login\?next=%2Fportal%2Fplayers/);
});

test('adding a player is guarded too — the form is never reachable anonymously', async ({
	page
}) => {
	await page.goto('/portal/players/new');
	await expect(page).toHaveURL(/\/login\?next=%2Fportal%2Fplayers%2Fnew/);
});

test('staff role management is refused, not hidden, for anonymous users', async ({ page }) => {
	const res = await page.goto('/admin/staff');
	expect(res?.url()).toMatch(/\/login/);
});

test('waiver signing is guarded — consent is never reachable anonymously', async ({ page }) => {
	await page.goto('/portal/waivers');
	await expect(page).toHaveURL(/\/login\?next=%2Fportal%2Fwaivers/);
});

test('waiver authoring is admin-only', async ({ page }) => {
	const res = await page.goto('/admin/waivers');
	expect(res?.url()).toMatch(/\/login/);
});

test('the public schedule page is readable without an account', async ({ page }) => {
	await page.goto('/schedule');
	await expect(page.getByRole('heading', { name: 'Schedule', level: 1 })).toBeVisible();
	// anon RLS is what makes this safe: scheduled sessions only, and no coach names
	await expect(page.getByText('Play by play of your time on court')).toBeVisible();
});

test('the family schedule is guarded, like the rest of the portal', async ({ page }) => {
	await page.goto('/portal/schedule');
	await expect(page).toHaveURL(/\/login\?next=%2Fportal%2Fschedule/);
});

test('booking, bookings and credits are guarded like the rest of the portal', async ({ page }) => {
	for (const path of [
		'/portal/book',
		'/portal/bookings',
		'/portal/credits',
		'/portal/purchases',
		'/portal/checkout/00000000-0000-4000-8000-000000000000'
	]) {
		await page.goto(path);
		await expect(page).toHaveURL(new RegExp(`/login\\?next=${encodeURIComponent(path)}`));
	}
});

test('coach tools and credit grants are refused, not hidden', async ({ page }) => {
	for (const path of ['/coach/sessions', '/admin/credits', '/admin/products', '/admin/orders']) {
		const res = await page.goto(path);
		expect(res?.url()).toMatch(/\/login/);
	}
});

test('the store is readable without an account, and asks anonymous visitors to log in', async ({
	page
}) => {
	await page.goto('/store');
	await expect(page.getByRole('heading', { name: 'Store', level: 1 })).toBeVisible();
	await expect(page.getByText('Weekday classes')).toBeVisible();
	await expect(page.getByText('Weekend classes')).toBeVisible();
	await expect(page.getByText('$500.00')).toBeVisible();
	await expect(page.getByText('$700.00')).toBeVisible();
	const action = page.getByRole('link', { name: 'Log in to buy' });
	await expect(action).toBeVisible();
	await expect(action).toHaveAttribute('href', '/login?next=/store');
});

test('the coaches page is public: six profiles, the founder first', async ({ page }) => {
	await page.goto('/coaches');
	await expect(page.getByRole('heading', { name: 'Coaches', level: 1 })).toBeVisible();
	const names = page.getByRole('article').getByRole('heading', { level: 2 });
	await expect(names).toHaveCount(6);
	await expect(names.first()).toHaveText('Artur Westergren');
	await expect(page.getByRole('img', { name: 'Portrait of Coach Artur Westergren' })).toBeVisible();
});
