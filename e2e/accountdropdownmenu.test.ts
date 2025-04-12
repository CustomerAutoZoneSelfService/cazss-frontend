import { test, expect } from '@playwright/test';

test('shows account dropdown menu and sign-out overlay', async ({ page }) => {
	await page.goto('/'); // Should work on any page with a sidebar

	// Click the user button to open dropdown
	await page.locator('#username-button').click();

	// Dropdown content should appear
	const dropdown = page.locator('.account-dropdown-menu');
	await expect(dropdown.getByText('John Doe')).toBeVisible();
	await expect(dropdown.getByText('some@domain.com')).toBeVisible();

	// Click Sign Out
	await page.getByRole('button', { name: 'Sign out' }).click();

	// "Signing out" overlay should appear
	await expect(page.getByText('Signing out')).toBeVisible();

	// Loading spinner should appear
	await expect(page.locator('svg')).toBeVisible();
});

test('shows the account dropdown menu, then closes it when clicking outside', async ({ page }) => {
	await page.goto('/'); // Should work on any page with a sidebar

	// Click the user button to open dropdown
	await page.locator('#username-button').click();

	// Dropdown content should appear
	const dropdown = page.locator('.account-dropdown-menu');
	await expect(dropdown.getByText('John Doe')).toBeVisible();
	await expect(dropdown.getByText('some@domain.com')).toBeVisible();

	await page.getByText('Click me too!').click();

	// User menu should no longer exist
	await expect(page.locator('.account-dropdown-menu')).toHaveCount(0);
});

test('shows the account dropdown menu,then closes it clicking the username button a second time', async ({
	page
}) => {
	await page.goto('/'); // Should work on any page with a sidebar

	// Click the user button to open dropdown
	await page.locator('#username-button').click();

	// Dropdown content should appear
	const dropdown = page.locator('.account-dropdown-menu');
	await expect(dropdown.getByText('John Doe')).toBeVisible();
	await expect(dropdown.getByText('some@domain.com')).toBeVisible();

	await page.locator('#username-button').click();

	// User menu should no longer exist
	await expect(page.locator('.account-dropdown-menu')).toHaveCount(0);
});
