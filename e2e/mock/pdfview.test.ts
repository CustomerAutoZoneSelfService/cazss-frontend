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

	test('should show PDF visualizer message after clicking Send', async ({ page }) => {
		await page.getByRole('button', { name: 'Send' }).click();

		const paragraph = page.locator('p', { hasText: 'Here goes the pdf visualizer and the button' });
		await expect(paragraph).toBeVisible();
	});
}
