import { expect, test } from '@playwright/test';

// Phase 5's exit criterion end to end on the simulated gateway: a purchase issues credits, the
// credits book a class, and refunding an untouched pack reverses them. Every movement is a row
// the audit trigger saw — the pages here only read what the database did.
//
// Needs an admin on the dev Supabase project (docs/OPERATIONS.md §2) and PAYMENTS_GATEWAY=fake.
// Without the credentials the spec skips rather than failing CI, which has no admin.
const EMAIL = process.env.E2E_ADMIN_EMAIL;
const PASSWORD = process.env.E2E_ADMIN_PASSWORD;
const stamp = Date.now();

test.describe('a purchase becomes credits, and an untouched pack refunds', () => {
	test.skip(
		!EMAIL || !PASSWORD,
		'Set E2E_ADMIN_EMAIL and E2E_ADMIN_PASSWORD to run this against dev'
	);
	test.setTimeout(180_000);

	test('buy → credits → book → refund is refused → cancel → refund reverses them', async ({
		page
	}) => {
		await page.goto('/login?next=/admin/waivers');
		await page.getByLabel('Email').fill(EMAIL!);
		await page.getByLabel('Password').fill(PASSWORD!);
		await page.getByRole('button', { name: 'Log in' }).click();
		await expect(page).toHaveURL(/\/admin\/waivers/);

		// The consent gate fails closed since 0008; publish a placeholder if dev has none.
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

		const playerName = `E2E Buyer ${stamp}`;
		await page.goto('/portal/players/new');
		await page.getByLabel('Name').fill(playerName);
		await page.getByLabel('Birthdate').fill('2014-06-11');
		await page.getByRole('button', { name: /Add player/i }).click();
		await expect(page.getByText(playerName).first()).toBeVisible();

		await page.goto('/portal/waivers');
		const sign = page.getByRole('link', { name: /Review and sign/i }).first();
		if (await sign.isVisible().catch(() => false)) {
			await sign.click();
			await page.getByLabel(/full name/i).fill('E2E Guardian');
			await page.getByRole('checkbox').check();
			await page.getByRole('button', { name: /Sign/i }).click();
		}

		// Buy the weekday pack for that player.
		await page.goto('/store');
		await page.getByRole('radio', { name: 'Weekday classes' }).check();
		await page.getByLabel('Player').selectOption({ label: playerName });
		await page.getByRole('button', { name: 'Continue to payment' }).click();

		// The simulated gateway's own page — no money moves, and it says so.
		await expect(page).toHaveURL(/\/portal\/checkout\//);
		await expect(page.getByText('SIMULATED CHECKOUT · DEV ONLY · NO MONEY MOVES')).toBeVisible();
		await page.getByRole('button', { name: 'Pay' }).click();

		await expect(page).toHaveURL(/\/portal\/purchases\?paid=/);
		await expect(page.getByText('PAID · CREDITS ISSUED')).toBeVisible();
		await expect(page.getByText('Weekday classes').first()).toBeVisible();

		// settle_order issued the pack through issue_credits, like every other credit.
		await page.goto('/portal/credits');
		await expect(page.getByText('10').first()).toBeVisible();

		// Drawing on the pack is what makes it unrefundable.
		await page.goto('/portal/book');
		const bookButton = page.getByRole('button', { name: /^Book · / }).first();
		await expect(bookButton).toBeVisible();
		await bookButton.click();
		await expect(page.getByText(/BOOKED —/)).toBeVisible();

		await page.goto('/admin/orders');
		await page
			.getByRole('link', { name: /^[0-9A-F]{8}$/ })
			.first()
			.click();
		await expect(page.getByRole('button', { name: 'Refund' })).toBeHidden();
		await expect(page.getByText(/Credits from this order have been used/)).toBeVisible();
		const orderUrl = page.url();

		// Give the credit back, and the pack is whole again.
		await page.goto('/portal/bookings');
		await page.getByRole('button', { name: 'Cancel' }).first().click();
		await page.getByRole('button', { name: 'Cancel booking' }).click();
		await expect(page.getByText(/the credit is back/)).toBeVisible();

		await page.goto(orderUrl);
		await page.getByRole('button', { name: 'Refund' }).click();
		await page.getByRole('button', { name: 'Refund order' }).click();
		await expect(page.getByText('REFUNDED · CREDITS REVERSED')).toBeVisible();

		// The reversal is a row, not an edit: the balance is zero and the refund is in the history.
		await page.goto('/portal/credits');
		await expect(page.getByText('refund').first()).toBeVisible();
	});
});
