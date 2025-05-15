import { test, expect } from '@playwright/test';

const pageURI = '/';

test('playwright passes tests', async ({ page }) => {
	await page.goto('/');

	await page.goto(`${pageURI}`);

	// Starting the test in the cell in the value Column of the first input row
	const searchbar = page.locator('input');
	await expect(searchbar.nth(0)).toBeVisible();
});
