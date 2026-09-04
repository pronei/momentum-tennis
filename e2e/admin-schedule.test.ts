import { expect, test } from '@playwright/test';

// The phase-3 walk-through, end to end: a court, the reservation that makes it schedulable, a
// class on that weekday, one week of occurrences, and the block on the day grid.
//
// It needs an admin account on the dev Supabase project, which is an operator step (see
// docs/OPERATIONS.md §2). Without the credentials the spec skips with a message rather than
// failing CI, which has no admin and never will.
const EMAIL = process.env.E2E_ADMIN_EMAIL;
const PASSWORD = process.env.E2E_ADMIN_PASSWORD;
const stamp = Date.now();

test.describe('admin schedules a real week', () => {
	test.skip(
		!EMAIL || !PASSWORD,
		'Set E2E_ADMIN_EMAIL and E2E_ADMIN_PASSWORD to run this against dev'
	);

	test('court → reservation window → class → occurrences → the day grid', async ({ page }) => {
		await page.goto('/login?next=/admin/availability');
		await page.getByLabel('Email').fill(EMAIL!);
		await page.getByLabel('Password').fill(PASSWORD!);
		await page.getByRole('button', { name: 'Log in' }).click();
		await expect(page).toHaveURL(/\/admin\/availability/);

		// A court at Murdock Park. Names are stamped so repeated runs never collide.
		const courtName = `E2E-${stamp}`;
		await page.getByLabel('Location').selectOption({ label: 'Murdock Park' });
		await page.getByLabel('Court name').fill(courtName);
		await page.getByRole('button', { name: 'Add court' }).click();
		await expect(page.getByRole('link', { name: courtName })).toBeVisible();

		// The reservation that makes it schedulable: Saturdays 09:00–13:00 from today.
		await page.getByRole('link', { name: courtName }).click();
		await page.getByLabel('Weekday').selectOption('6');
		await page.getByLabel('Opens').fill('09:00');
		await page.getByLabel('Closes').fill('13:00');
		await page.getByRole('button', { name: 'Declare window' }).click();
		// DataTable renders the table and the ≤760px cards, so each value appears twice
		await expect(page.getByText('09:00–13:00').first()).toBeVisible();

		// A term and a Saturday class on that court.
		const termName = `E2E term ${stamp}`;
		const className = `E2E class ${stamp}`;
		const today = new Date().toISOString().slice(0, 10);
		const inAMonth = new Date(Date.now() + 30 * 86_400_000).toISOString().slice(0, 10);
		await page.goto('/admin/classes');
		await page.getByLabel('Name').first().fill(termName);
		await page.getByLabel('Starts').first().fill(today);
		await page.getByLabel('Ends').first().fill(inAMonth);
		await page.getByRole('button', { name: 'Add term' }).click();
		await expect(page.getByRole('link', { name: termName })).toBeVisible();

		await page.getByRole('link', { name: termName }).click();
		await page.getByLabel('Name').last().fill(className);
		await page.getByLabel('Weekday').selectOption('6');
		await page.getByLabel('Starts').last().fill('09:00');
		await page.getByLabel('Length').selectOption('120');
		await page.getByLabel('Seats').fill('6');
		await page.getByLabel('Default court').selectOption({ label: `${courtName} · Murdock Park` });
		await page.getByRole('button', { name: 'Add class' }).click();
		await expect(page.getByRole('cell', { name: className })).toBeVisible();

		// Generate the term's occurrences. Dates whose court is not reserved are reported, not fatal.
		await page.getByRole('link', { name: className }).first().click();
		await page.getByRole('button', { name: 'Generate' }).click();
		await expect(page.getByText(/CREATED \d+/)).toBeVisible();

		// And the block is on the grid, on the first Saturday inside the window.
		const saturday = new Date();
		saturday.setDate(saturday.getDate() + ((6 - saturday.getDay() + 7) % 7 || 7));
		await page.goto(`/admin/schedule?date=${saturday.toISOString().slice(0, 10)}`);
		await expect(page.getByRole('link', { name: new RegExp(className) }).first()).toBeVisible();
	});
});
