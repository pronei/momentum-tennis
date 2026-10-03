import { expect, test } from '@playwright/test';

// Phase 10's exit criterion end to end: a coach records a match on a phone-sized window, the gate
// refuses the card until every line is complete, and a final card exports the observed-card JSON.
//
// Needs the dev coach and the fictional team the phase-10 seed script makes (docs/OPERATIONS.md
// §7). Without the credentials the spec skips rather than failing CI.
const EMAIL = process.env.E2E_COACH_EMAIL;
const PASSWORD = process.env.E2E_COACH_PASSWORD;
const stamp = Date.now();
const SINGLES = ['#1 SINGLES', '#2 SINGLES', '#3 SINGLES', '#4 SINGLES'];
const DOUBLES = ['#1 DOUBLES', '#2 DOUBLES', '#3 DOUBLES', '#4 DOUBLES'];

test.describe('a coach records a match', () => {
	test.skip(
		!EMAIL || !PASSWORD,
		'Set E2E_COACH_EMAIL and E2E_COACH_PASSWORD to run this against dev'
	);
	test.setTimeout(120_000);
	test.use({ viewport: { width: 390, height: 844 } });

	test('new card → lines → the gate → finalize → export', async ({ page }) => {
		await page.goto('/scorecard');
		await expect(page).toHaveURL(/\/login\?next=%2Fcoach%2Fscorecards/);
		await page.getByLabel('Email').fill(EMAIL!);
		await page.getByLabel('Password').fill(PASSWORD!);
		await page.getByRole('button', { name: 'Log in' }).click();
		await expect(page).toHaveURL(/\/coach\/scorecards$/);

		await page.getByRole('link', { name: 'New scorecard' }).click();
		await page.getByLabel('Team').selectOption({ label: /Momentum Test 12U Green/ });
		await page.getByRole('button', { name: 'Choose team' }).click();
		await expect(page.getByRole('button', { name: 'Create card' })).toBeVisible();
		const matchId = String(9_000_000 + (stamp % 1_000_000));
		await page.getByLabel('USTA match id').fill(matchId);
		await page.getByLabel('Visiting team').fill(`E2E Visitors ${stamp}`);
		await page.getByRole('button', { name: 'Create card' }).click();
		await expect(page).toHaveURL(/\/coach\/scorecards\/[0-9a-f-]{36}$/);

		// One line, then the gate refuses: seven lines have no score yet.
		const line1 = page.getByRole('group', { name: '#1 SINGLES' });
		await line1.getByLabel('Player 1').nth(0).fill('Ada Lovelace');
		await line1.getByLabel('Player 1').nth(1).fill('Theo B.');
		await line1.getByLabel('Games').nth(0).fill('6');
		await line1.getByLabel('Games').nth(1).fill('2');
		await page.getByRole('button', { name: 'Finalize' }).click();
		await expect(page.getByText(/cannot be finalized yet/)).toBeVisible();
		await expect(page.getByText('#2 SINGLES · NO SCORE')).toBeVisible();

		// The rest of the card: our side wins every line.
		for (const name of SINGLES.slice(1)) {
			const g = page.getByRole('group', { name });
			await g.getByLabel('Player 1').nth(0).fill('Grace Hopper');
			await g.getByLabel('Player 1').nth(1).fill('Kai V.');
			await g.getByLabel('Games').nth(0).fill('6');
			await g.getByLabel('Games').nth(1).fill('3');
		}
		for (const name of DOUBLES) {
			const g = page.getByRole('group', { name });
			await g.getByLabel('Player 1').nth(0).fill('Alan Turing');
			await g.getByLabel('Player 2').nth(0).fill('Barbara Liskov');
			await g.getByLabel('Player 1').nth(1).fill('Wren W.');
			await g.getByLabel('Player 2').nth(1).fill('Vera V.');
			await g.getByLabel('Games').nth(0).fill('6');
			await g.getByLabel('Games').nth(1).fill('1');
		}
		await page.getByRole('button', { name: 'Save' }).click();
		await expect(page.getByText('SAVED')).toBeVisible();
		await expect(page.getByText('READY TO FINALIZE')).toBeVisible();

		await page.getByRole('button', { name: 'Finalize' }).click();
		await expect(page.getByText('FINAL · READY TO EXPORT')).toBeVisible();
		await expect(page.getByLabel('USTA match id')).toBeDisabled();

		const download = page.waitForEvent('download');
		await page.getByRole('link', { name: 'Export JSON' }).click();
		const file = await download;
		expect(file.suggestedFilename()).toBe(`scorecard-${matchId}.json`);
		const chunks: Buffer[] = [];
		for await (const chunk of await file.createReadStream()) chunks.push(Buffer.from(chunk));
		const body = JSON.parse(Buffer.concat(chunks).toString());
		expect(body.card.match_id).toBe(matchId);
		expect(body.card.lines).toHaveLength(8);
		expect(body.card.printed_home_total).toBe(48);
	});
});
