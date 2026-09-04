import { expect, test } from '@playwright/test';

test('home renders the brand and the one primary action', async ({ page }) => {
	await page.goto('/');
	await expect(page.getByRole('heading', { level: 1 })).toContainText('Building players');
	await expect(page.getByRole('link', { name: 'Book a free trial class' })).toBeVisible();
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
});

test('the portal is guarded at the server: anonymous users land on login with next', async ({
	page
}) => {
	await page.goto('/portal/account');
	await expect(page).toHaveURL(/\/login\?next=%2Fportal%2Faccount/);
	await expect(page.getByLabel('Email')).toBeVisible();
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
	for (const path of ['/portal/book', '/portal/bookings', '/portal/credits']) {
		await page.goto(path);
		await expect(page).toHaveURL(new RegExp(`/login\\?next=${encodeURIComponent(path)}`));
	}
});

test('coach tools and credit grants are refused, not hidden', async ({ page }) => {
	for (const path of ['/coach/sessions', '/admin/credits']) {
		const res = await page.goto(path);
		expect(res?.url()).toMatch(/\/login/);
	}
});
