import { test, expect } from '@playwright/test';
import { initE2EMocked } from '../initE2EMocked';

const path = '/'; 

test.beforeEach(async ({ page }, testInfo) => {
	await initE2EMocked(page, testInfo);
	await page.goto(path);
});

test('nuevo endpoint creado debe mostrarse en la interfaz', async ({ page }) => {
	const endpointCard = page.locator('[data-endpoint-id="52"]', {
		hasText: 'Test Service'
	});
	await expect(endpointCard).toBeVisible();

	await expect(endpointCard).toHaveText(/This is a test for POST/);
});
