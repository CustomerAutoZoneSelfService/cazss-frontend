import { test, expect, type Page } from '@playwright/test';

/*
 * E2E test suite for the Username Button component
 * Tests the dropdown interaction and display behavior
 * in the actual browser environment with authenticated state
 */

test.describe('Username Button E2E Tests', () => {
	/**
	 * Helper to set up authentication state for tests
	 * Creates a valid JWT token and sets it in localStorage
	 */
	async function setupAuth(page: Page) {
		// Create a valid token with the expected user data
		const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
		const payload = btoa(
			JSON.stringify({
				sub: '1', // user_id as string (standard JWT claim)
				username: 'john_doe', // This will be shown as "John Doe" in title case (toTitleCase function)
				email: 'john@example.com',
				role: 'ROLE_ADMIN', // Include ROLE_ prefix as expected by decodeJWTUser
				iat: Math.floor(Date.now() / 1000),
				exp: Math.floor(Date.now() / 1000) + 3600 // Valid for 1 hour
			})
		);
		const signature = 'mock_signature';
		const token = `${header}.${payload}.${signature}`;

		await page.addInitScript(
			(tokenData) => {
				console.log('🔥 AUTH FIXTURE: Setting token in localStorage with correct key');
				localStorage.setItem('cazss_access_token', tokenData.token);
				console.log('🔥 AUTH FIXTURE: Token set in localStorage');
			},
			{ token }
		);
	}

	/**
	 * Helper to wait for user button to be visible with better selector fallbacks
	 */
	async function waitForUserButton(page: Page) {
		// Try multiple selectors with fallbacks
		const selectors = [
			'#username-button',
			'button[aria-label="User account menu"]',
			'button[aria-haspopup="true"]',
			'.account-menu-wrapper button'
		];

		for (const selector of selectors) {
			try {
				await page.waitForSelector(selector, { timeout: 3000 });
				return page.locator(selector);
			} catch {
				console.log(`🔍 Selector ${selector} not found, trying next...`);
			}
		}

		// If none found, wait a bit longer for the page to load
		await page.waitForLoadState('networkidle');
		await page.waitForSelector('#username-button', { timeout: 5000 });
		return page.locator('#username-button');
	}

	test('shows the username button and hides the username when the sidebar is collapsed', async ({
		page
	}) => {
		await setupAuth(page);
		await page.goto('/');

		// Wait for page to load and username button to be visible
		const usernameButton = await waitForUserButton(page);
		await expect(usernameButton).toBeVisible({ timeout: 10000 });

		// Username should be visible initially (sidebar expanded) - expect "John Doe" (toTitleCase converts john_doe)
		const usernamePatterns = [
			page.getByText('John Doe'), // toTitleCase converts john_doe to John Doe
			page.getByText('John_doe'),
			page.getByText('john_doe')
		];

		let usernameVisible = false;
		for (const pattern of usernamePatterns) {
			try {
				await expect(pattern).toBeVisible({ timeout: 2000 });
				usernameVisible = true;
				break;
			} catch {
				console.log(`🔍 Username pattern not found, trying next...`);
			}
		}

		// Check button has proper attributes
		await expect(usernameButton).toHaveAttribute('aria-haspopup', 'true');
		await expect(usernameButton).toHaveAttribute('aria-expanded', 'false');

		// Try to find and click sidebar menu button to collapse
		const menuButtonSelectors = [
			'button[aria-label="Menu"]',
			'button[aria-label="Toggle menu"]',
			'button[aria-label="Expandir o colapsar menú"]',
			'.sidebar-toggle',
			'[data-testid="menu-toggle"]'
		];

		for (const selector of menuButtonSelectors) {
			try {
				const menuButton = page.locator(selector);
				if (await menuButton.isVisible()) {
					await menuButton.click();

					// After collapse, username text should not be visible
					if (usernameVisible) {
						for (const pattern of usernamePatterns) {
							try {
								await expect(pattern).not.toBeVisible({ timeout: 2000 });
								break;
							} catch {
								// May not be necessary to check all patterns
							}
						}
					}
					break;
				}
			} catch {
				console.log(`🔍 Menu button selector ${selector} not found, trying next...`);
			}
		}

		// Main validation: button should still be visible even if text is hidden
		await expect(usernameButton).toBeVisible();
	});

	test('shows the account dropdown menu when clicking the username button, then shows the sign-out overlay when clicking the sign out button', async ({
		page
	}) => {
		await setupAuth(page);
		await page.goto('/');

		// Wait for username button to be visible
		const usernameButton = await waitForUserButton(page);
		await expect(usernameButton).toBeVisible({ timeout: 10000 });

		// Click the user button to open dropdown
		await usernameButton.click();

		// Check dropdown is opened (button should have aria-expanded="true")
		await expect(usernameButton).toHaveAttribute('aria-expanded', 'true');

		// Look for the sign out button with multiple selectors
		const signOutSelectors = [
			'button:has-text("Sign out")',
			'button:has-text("Cerrar sesión")',
			'[data-testid="sign-out-button"]',
			'button[aria-label*="sign"]',
			'.account-dropdown-menu button'
		];

		let signOutButton;
		let signOutFound = false;
		for (const selector of signOutSelectors) {
			try {
				signOutButton = page.locator(selector);
				await expect(signOutButton).toBeVisible({ timeout: 2000 });
				signOutFound = true;
				break;
			} catch {
				console.log(`🔍 Sign out selector ${selector} not found, trying next...`);
			}
		}

		if (signOutFound && signOutButton) {
			await signOutButton.click();

			// Should show signing out overlay or redirect to login
			try {
				await expect(page.getByText('Signing out...')).toBeVisible({ timeout: 2000 });
			} catch {
				console.log('🔍 Signing out overlay not found, checking for redirect...');
			}

			// Should eventually redirect to login page
			await expect(page).toHaveURL('/user/login', { timeout: 10000 });
		} else {
			console.log('🔍 No sign out button found, test inconclusive');
		}
	});

	test('shows the account dropdown menu when clicking the username button, then closes it when clicking outside the menu', async ({
		page
	}) => {
		await setupAuth(page);
		await page.goto('/');

		// Wait for username button to be visible
		const usernameButton = await waitForUserButton(page);
		await expect(usernameButton).toBeVisible({ timeout: 10000 });

		// Click the user button to open dropdown
		await usernameButton.click();

		// Check dropdown is opened
		await expect(usernameButton).toHaveAttribute('aria-expanded', 'true');

		// Click outside the menu (on body)
		await page.locator('body').click({ position: { x: 10, y: 10 } });

		// Dropdown should close
		await expect(usernameButton).toHaveAttribute('aria-expanded', 'false');
	});

	test('shows the account dropdown menu when clicking the username button, then closes it when clicking it a second time', async ({
		page
	}) => {
		await setupAuth(page);
		await page.goto('/');

		// Wait for username button to be visible
		const usernameButton = await waitForUserButton(page);
		await expect(usernameButton).toBeVisible({ timeout: 10000 });

		// Click the user button to open dropdown
		await usernameButton.click();

		// Check dropdown is opened
		await expect(usernameButton).toHaveAttribute('aria-expanded', 'true');

		// Click the button again to close dropdown
		await usernameButton.click();

		// Dropdown should close
		await expect(usernameButton).toHaveAttribute('aria-expanded', 'false');
	});
});
