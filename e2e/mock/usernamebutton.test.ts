// import { test, expect } from '@playwright/test';
//
// const pages = ['demo/username-button'];
//
// for (const path of pages) {
// 	test.beforeEach(async ({ page }) => {
// 		await page.goto(`${path}`);
// 	});
//
// 	test('shows the username button and hides the username when the sidebar is collapsed', async ({
// 		page
// 	}) => {
// 		await expect(page.locator('#username-button')).toBeVisible();
// 		// Once the sidebar is done, I will make this test.
// 		// I can not give the old Sidebar test ids since they will be overridden once
// 		// the full sidebar is pushed to dev.
// 	});
//
// 	test(
// 		'shows the account dropdown menu when clicking the username button, then shows the' +
// 			' sign-out overlay when clicking the sign out button',
// 		async ({ page }) => {
// 			// Click the user button to open dropdown
// 			await page.locator('#username-button').click();
//
// 			// Dropdown content should appear
// 			const dropdown = page.locator('.account-dropdown-menu');
// 			await expect(dropdown.locator('.user-info')).toBeVisible();
//
// 			// Click Sign Out
// 			await page.getByRole('button', { name: 'Sign out' }).click();
//
// 			// Sign out overlay should appear
// 			await expect(page.locator('.sign-out-overlay')).toBeVisible();
// 		}
// 	);
//
// 	test(
// 		'shows the account dropdown menu when clicking the username button, then closes it when' +
// 			' clicking outside the menu',
// 		async ({ page }) => {
// 			// Click the user button to open dropdown
// 			await page.locator('#username-button').click();
//
// 			// Dropdown content should appear
// 			const dropdown = page.locator('.account-dropdown-menu');
// 			await expect(dropdown.locator('.user-info')).toBeVisible();
//
// 			await page.locator('body').click();
//
// 			// User menu should no longer exist
// 			await expect(page.locator('.account-dropdown-menu')).toHaveCount(0);
// 		}
// 	);
//
// 	test(
// 		'shows the account dropdown menu when clicking the username button, then closes it when' +
// 			' clicking it a second time',
// 		async ({ page }) => {
// 			// Click the user button to open dropdown
// 			await page.locator('#username-button').click();
//
// 			// Dropdown content should appear
// 			const dropdown = page.locator('.account-dropdown-menu');
// 			await expect(dropdown.locator('.user-info')).toBeVisible();
//
// 			await page.locator('#username-button').click();
//
// 			// User menu should no longer exist
// 			await expect(page.locator('.account-dropdown-menu')).toHaveCount(0);
// 		}
// 	);
// }
