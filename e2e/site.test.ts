import { expect, test } from '@playwright/test';

// The public site's walk, and the lightbox gate from docs/decisions/2026-09-05-lightbox-library.md:
// text controls and no icons, Escape closes, arrows move, focus returns, reduced motion is instant.

test('a photo opens in the lightbox with text controls; keys move and close it', async ({
	page
}) => {
	await page.goto('/photos');
	await expect(page.getByRole('heading', { name: 'Photos', level: 1 })).toBeVisible();
	const first = page.locator('a[data-pswp-width]').first();
	await first.click();

	const dialog = page.locator('.pswp[role="dialog"]');
	await expect(dialog).toBeVisible();
	await expect(dialog).toHaveAttribute('aria-modal', 'true');
	await expect(dialog).toHaveAttribute('aria-label', 'Photo viewer');
	for (const label of ['PREV', 'NEXT', 'CLOSE'])
		await expect(dialog.getByRole('button', { name: label, exact: true })).toBeVisible();
	await expect(dialog.locator('.pswp__button svg')).toHaveCount(0);

	const counter = dialog.locator('.pswp__counter');
	await expect(counter).toHaveText(/^1 \/ \d+$/);
	// PhotoSwipe binds its keys when the opening animation ends — the moment it shows the
	// neighbouring slides' holders, so wait for the next one rather than for a guessed delay
	await expect(dialog.locator('.pswp__item').nth(2)).toBeVisible();
	await page.keyboard.press('ArrowRight');
	await expect(counter).toHaveText(/^2 \/ \d+$/);

	await page.keyboard.press('Escape');
	await expect(dialog).toHaveCount(0);
	await expect(first).toBeFocused();
});

test('opened from the keyboard, focus moves into the viewer and comes back on Escape', async ({
	page
}) => {
	await page.goto('/photos');
	const first = page.locator('a[data-pswp-width]').first();
	await first.focus();
	await page.keyboard.press('Enter');
	const dialog = page.locator('.pswp[role="dialog"]');
	await expect(dialog).toBeFocused();
	await page.keyboard.press('Escape');
	await expect(dialog).toHaveCount(0);
	await expect(first).toBeFocused();
});

test('under reduced motion the lightbox opens without animating', async ({ page }) => {
	await page.emulateMedia({ reducedMotion: 'reduce' });
	await page.goto('/photos');
	await page.locator('a[data-pswp-width]').first().click();
	const dialog = page.locator('.pswp[role="dialog"]');
	await expect(dialog).toBeVisible();
	expect(
		await dialog.evaluate((el) =>
			getComputedStyle(el).getPropertyValue('--pswp-transition-duration').trim()
		)
	).toBe('0ms');
});
