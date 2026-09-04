import { expect, test } from '@playwright/test';

// Phase 4's exit criterion end to end: a granted credit becomes a booking, and cancelling gives it
// back. It runs entirely as the admin account, which is also an ordinary account and so can guard a
// player of its own — that is the same path a family takes.
//
// Needs an admin on the dev Supabase project (docs/OPERATIONS.md §2). Without the credentials the
// spec skips rather than failing CI, which has no admin.
const EMAIL = process.env.E2E_ADMIN_EMAIL;
const PASSWORD = process.env.E2E_ADMIN_PASSWORD;
const stamp = Date.now();

test.describe('a granted credit becomes a booking', () => {
	test.skip(
		!EMAIL || !PASSWORD,
		'Set E2E_ADMIN_EMAIL and E2E_ADMIN_PASSWORD to run this against dev'
	);
	test.setTimeout(120_000);

	test('grant → sign → book → cancel → the credit is back', async ({ page }) => {
		await page.goto('/login?next=/admin/waivers');
		await page.getByLabel('Email').fill(EMAIL!);
		await page.getByLabel('Password').fill(PASSWORD!);
		await page.getByRole('button', { name: 'Log in' }).click();
		await expect(page).toHaveURL(/\/admin\/waivers/);

		// 0008 fails the consent gate closed: a required document with no published version refuses
		// booking outright. Publish one if dev has none. The text is placeholder and says so —
		// the real wording comes from the academy's lawyer.
		await page.getByRole('link', { name: 'Participation waiver' }).first().click();
		const published = page.getByText(/PUBLISHED/).first();
		if (!(await published.isVisible().catch(() => false))) {
			await page
				.getByLabel('Document text')
				.fill('FROM LEGAL — placeholder for the dev environment. Not legal text.');
			await page.getByRole('button', { name: /Save draft/i }).click();
			await page
				.getByRole('button', { name: /^Publish/ })
				.first()
				.click();
			await page.getByRole('button', { name: /Publish version/i }).click();
		}

		// A player of our own, so guards() is satisfied exactly as it is for a family.
		const playerName = `E2E Player ${stamp}`;
		await page.goto('/portal/players/new');
		await page.getByLabel('Name').fill(playerName);
		await page.getByLabel('Birthdate').fill('2014-04-02');
		await page.getByRole('button', { name: /Add player/i }).click();
		await expect(page.getByText(playerName).first()).toBeVisible();

		// Sign the current waiver for that player — the gate booking will check.
		await page.goto('/portal/waivers');
		const sign = page.getByRole('link', { name: /Review and sign/i }).first();
		if (await sign.isVisible().catch(() => false)) {
			await sign.click();
			await page.getByLabel(/full name/i).fill('E2E Guardian');
			await page.getByRole('checkbox').check();
			await page.getByRole('button', { name: /Sign/i }).click();
		}

		// Grant the credit through the one issuance path.
		await page.goto(`/admin/credits?q=${encodeURIComponent(playerName)}`);
		await page.getByRole('button', { name: 'Choose' }).first().click();
		await page.getByLabel('Credits').selectOption('class_weekday');
		await page.getByLabel('How many').fill('2');
		await page.getByLabel('Reason').fill(`e2e ${stamp}`);
		await page.getByRole('button', { name: 'Grant credits' }).click();
		await expect(page.getByText(/GRANTED ·/)).toBeVisible();

		// Book the first weekday class the portal offers.
		await page.goto('/portal/book');
		const bookButton = page.getByRole('button', { name: /^Book · / }).first();
		await expect(bookButton).toBeVisible();
		await bookButton.click();
		await expect(page.getByText(/BOOKED —/)).toBeVisible();

		// It shows up, and cancelling returns the credit.
		await page.goto('/portal/bookings');
		await expect(page.getByText(/CANCEL NOW AND THE CREDIT RETURNS/).first()).toBeVisible();
		await page.getByRole('button', { name: 'Cancel' }).first().click();
		await page.getByRole('button', { name: 'Cancel booking' }).click();
		await expect(page.getByText(/the credit is back/)).toBeVisible();

		// And the ledger shows both movements.
		await page.goto('/portal/credits');
		await expect(page.getByText('consume').first()).toBeVisible();
		await expect(page.getByText('consume reversal').first()).toBeVisible();
	});
});
