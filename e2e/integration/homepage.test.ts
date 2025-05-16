import { test, expect } from '@playwright/test';
import { initE2EMocked } from '../initE2EMocked';

const pageURI = '/';

test.beforeEach(async ({ page }, testInfo) => {
	await initE2EMocked(page, testInfo); // Call the initialization function
	await page.goto(`${pageURI}`);
});

test('playwright passes tests', async ({ page }) => {
	await page.goto('/');

	await page.goto(`${pageURI}`);

	// Starting the test in the cell in the value Column of the first input row
	const searchbar = page.locator('input');
	await expect(searchbar.nth(0)).toBeVisible();
});
