import { test, expect } from '@playwright/test';
import { initE2EMocked } from '../initE2EMocked';

const pages = ['endpoint/5'];

for (const path of pages) {
	test.beforeEach(async ({ page }, testInfo) => {
		await initE2EMocked(page, testInfo); // Call the initialization function
		await page.goto(`${path}`);
	});

	test('should have an h1 with text "Pdf demo"', async ({ page }) => {
		const h1 = page.locator('h1', { hasText: 'Pdf demo' });
		await expect(h1).toBeVisible();
	});
}
