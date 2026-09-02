import { expect, test } from '@playwright/test';

test('home renders the brand and the one primary action', async ({ page }) => {
	await page.goto('/');
	await expect(page.getByRole('heading', { level: 1 })).toContainText('Building players');
	await expect(page.getByRole('link', { name: 'Book a free trial class' })).toBeVisible();
});

test('styleguide renders every ported component group', async ({ page }) => {
	await page.goto('/styleguide');
	await expect(page.getByRole('heading', { name: 'Styleguide' })).toBeVisible();
	await expect(page.getByRole('radiogroup')).toBeVisible();
	await expect(page.getByRole('navigation', { name: 'Pagination' })).toBeVisible();
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
