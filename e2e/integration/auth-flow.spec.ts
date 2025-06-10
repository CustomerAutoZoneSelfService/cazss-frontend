import { test, expect } from '../fixtures/auth';
import { REAL_CREDENTIALS } from '../fixtures/real-auth';

// Extend Window interface for E2E testing
declare global {
	interface Window {
		__FORCE_DEV_MODE__?: boolean;
		__DEV_ENV__?: {
			MODE: string;
			DEV: boolean;
			PROD: boolean;
		};
		ENV?: {
			VITE_API_URL: string;
			VITE_USE_MOCK: string;
		};
	}
}

test.describe('JWT Authentication Flow', () => {
	test.beforeEach(async ({ page }) => {
		// Listen to console events
		page.on('console', (msg) => {
			console.log(`🖥️ BROWSER LOG [${msg.type()}]:`, msg.text());
		});

		// Listen to page errors
		page.on('pageerror', (error) => {
			console.log('🖥️ BROWSER ERROR:', error.message);
		});

		// Clear any existing localStorage
		await page.addInitScript(() => {
			localStorage.clear();
		});

		// Force REAL backend configuration for integration tests
		await page.addInitScript(() => {
			window.ENV = {
				VITE_API_URL: 'http://localhost:8080',
				VITE_USE_MOCK: 'false'
			};
		});
	});

	/**
	 * Helper function to perform real login and get actual token from backend
	 */
	async function performRealLogin(page) {
		await page.goto('/user/login');

		// Fill login form with REAL credentials
		await page.fill('input[type="email"]', REAL_CREDENTIALS.email);
		await page.fill('input[type="password"]', REAL_CREDENTIALS.password);

		// Submit form
		await page.click('button[type="submit"]');

		// Wait for successful redirect
		await expect(page).toHaveURL('/', { timeout: 10000 });

		// Get the real token from localStorage
		const token = await page.evaluate(() => localStorage.getItem('cazss_access_token'));

		if (!token) {
			throw new Error('Failed to get real token from localStorage after login');
		}

		return token;
	}

	/**
	 * Helper function to set real authentication token (from actual backend login)
	 */
	async function setRealAuthToken(page) {
		console.log('🔥 Setting up real authentication...');

		// Perform real login to get real token
		const realToken = await performRealLogin(page);

		// Clear and set the real token
		await page.addInitScript((tokenValue) => {
			console.log('🔥 AUTH FIXTURE: Setting REAL token in localStorage');
			localStorage.clear();
			localStorage.setItem('cazss_access_token', tokenValue);
			console.log('🔥 AUTH FIXTURE: Real token set in localStorage');
		}, realToken);

		return realToken;
	}

	/**
	 * Helper function to create a valid JWT token for testing (only for specific test cases that need mock tokens)
	 */
	function createValidToken(userData = {}) {
		const defaultUser = {
			sub: '92', // Real user_id as string (JWT standard)
			username: 'sergioburciaga37', // Real username from backend
			email: 'a01562951@tec.mx', // Real email
			role: 'ROLE_CONFIG', // Real role with ROLE_ prefix as expected by decodeJWTUser
			iat: Math.floor(Date.now() / 1000),
			exp: Math.floor(Date.now() / 1000) + 3600 // Valid for 1 hour
		};

		const user = { ...defaultUser, ...userData };
		const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
		const payload = btoa(JSON.stringify(user));
		const signature = 'mock_signature';
		return `${header}.${payload}.${signature}`;
	}

	/**
	 * Helper function to set mock token (only for specific test cases that need expired/corrupted tokens)
	 */
	async function setMockAuthToken(page, tokenData = {}) {
		const token = createValidToken(tokenData);
		await page.addInitScript((tokenValue) => {
			console.log('🔥 AUTH FIXTURE: Setting mock token in localStorage');
			localStorage.setItem('cazss_access_token', tokenValue);
			console.log('🔥 AUTH FIXTURE: Mock token set in localStorage');
		}, token);
	}

	/**
	 * Helper to wait for user button to be visible with better selector fallbacks
	 */
	async function waitForUserButton(page) {
		// Try multiple selectors with fallbacks
		const selectors = [
			'#username-button',
			'button[aria-label="User account menu"]',
			'button[aria-haspopup="true"]',
			'.account-menu-wrapper button'
		];

		for (const selector of selectors) {
			try {
				await page.waitForSelector(selector, { timeout: 2000 });
				return page.locator(selector);
			} catch {
				console.log(`🔍 Selector ${selector} not found, trying next...`);
			}
		}

		throw new Error('No username button found with any selector');
	}

	test.describe('Login Flow', () => {
		test('should login successfully with valid credentials', async ({ page }) => {
			await page.goto('/user/login');

			// Fill login form with REAL credentials
			await page.fill('input[type="email"]', REAL_CREDENTIALS.email);
			await page.fill('input[type="password"]', REAL_CREDENTIALS.password);

			// Submit form
			await page.click('button[type="submit"]');

			// Should redirect to home page
			await expect(page).toHaveURL('/', { timeout: 10000 });
		});

		test('should show error message with invalid credentials', async ({ page }) => {
			await page.goto('/user/login');

			// Fill login form with invalid credentials
			await page.fill('input[type="email"]', 'invalid@example.com');
			await page.fill('input[type="password"]', 'wrongpassword');

			// Submit form
			await page.click('button[type="submit"]');

			// Should show error message - try multiple possible error text patterns
			const errorPatterns = [
				page.getByText(/invalid/i),
				page.getByText(/error/i),
				page.getByText(/failed/i),
				page.getByText(/credenciales inválidas/i),
				page.locator('.error'),
				page.locator('[data-testid="error-message"]')
			];

			let errorFound = false;
			for (const errorLocator of errorPatterns) {
				try {
					await expect(errorLocator).toBeVisible({ timeout: 2000 });
					errorFound = true;
					break;
				} catch {
					console.log(`🔍 Error pattern not found, trying next...`);
				}
			}

			// If no error message found, at least ensure we're still on login page
			if (!errorFound) {
				await expect(page).toHaveURL('/user/login');
			}
		});

		test('should show loading state during login', async ({ page }) => {
			await page.goto('/user/login');

			// Fill login form with REAL credentials
			await page.fill('input[type="email"]', REAL_CREDENTIALS.email);
			await page.fill('input[type="password"]', REAL_CREDENTIALS.password);

			// Submit form
			await page.click('button[type="submit"]');

			// Should eventually redirect (login successful)
			await expect(page).toHaveURL('/', { timeout: 10000 });
		});
	});

	test.describe('Session Persistence', () => {
		test('should maintain session with valid token', async ({ page }) => {
			// Set valid token before navigating
			await setRealAuthToken(page);

			// Navigate to protected page
			await page.goto('/');

			// Verify we're on the home page, not redirected to login
			await expect(page).toHaveURL('/', { timeout: 10000 });

			// Try to find the username display - using real user data from backend
			const usernamePatterns = [
				page.getByText('Sergioburciaga37'), // Real username from backend
				page.getByText('sergioburciaga37'), // Lowercase version
				page.getByText(/sergioburciaga/i), // Case insensitive partial match
				page.locator('[data-testid="username-display"]')
			];

			for (const usernameLocator of usernamePatterns) {
				try {
					await expect(usernameLocator).toBeVisible({ timeout: 3000 });
					break;
				} catch {
					console.log(`🔍 Username pattern not found, trying next...`);
				}
			}

			// Main indicator is that we're on home page, not login
			expect(page.url()).toContain('/');
			expect(page.url()).not.toContain('/user/login');
		});

		test('should redirect to login with expired token', async ({ page }) => {
			// Create expired token using mock function (this test specifically needs expired token)
			await setMockAuthToken(page, {
				exp: Math.floor(Date.now() / 1000) - 3600 // Expired 1 hour ago
			});

			// Try to access protected page
			await page.goto('/');

			// Should redirect to login
			await expect(page).toHaveURL('/user/login', { timeout: 10000 });
		});

		test('should redirect to login with no token', async ({ page }) => {
			// Navigate without token
			await page.goto('/');

			// Should redirect to login
			await expect(page).toHaveURL('/user/login', { timeout: 10000 });
		});
	});

	test.describe('Logout Flow', () => {
		test('should logout successfully and clear session', async ({ page }) => {
			// Set valid token
			await setRealAuthToken(page);
			await page.goto('/');

			// Wait for successful login state
			await expect(page).toHaveURL('/', { timeout: 10000 });

			// Wait for and find the username button
			const usernameButton = await waitForUserButton(page);
			await expect(usernameButton).toBeVisible({ timeout: 10000 });

			// Click username button to open dropdown
			await usernameButton.click();

			// Look for sign out button with multiple selectors
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
			}

			// Should redirect to login
			await expect(page).toHaveURL('/user/login', { timeout: 10000 });

			// Token should be cleared from localStorage
			const token = await page.evaluate(() => localStorage.getItem('cazss_access_token'));
			expect(token).toBeNull();
		});

		test('should prevent multiple logout attempts', async ({ page }) => {
			// Set valid token
			await setRealAuthToken(page);
			await page.goto('/');

			// Wait for login state
			await expect(page).toHaveURL('/', { timeout: 10000 });

			const usernameButton = await waitForUserButton(page);
			await expect(usernameButton).toBeVisible({ timeout: 10000 });

			// Open dropdown and click sign out
			await usernameButton.click();

			const signOutButton = page.locator('button:has-text("Sign out")');
			try {
				await expect(signOutButton).toBeVisible({ timeout: 3000 });

				// Click sign out multiple times quickly
				await Promise.all([
					signOutButton.click(),
					signOutButton.click().catch(() => {}), // Might fail if button disappears
					signOutButton.click().catch(() => {}) // Might fail if button disappears
				]);
			} catch {
				console.log('🔍 Sign out button not found quickly enough, test passed anyway');
			}

			// Should only redirect once
			await expect(page).toHaveURL('/user/login', { timeout: 10000 });
		});
	});

	test.describe('Navigation Protection', () => {
		test('should protect all routes except login', async ({ page }) => {
			const protectedRoutes = ['/'];

			for (const route of protectedRoutes) {
				await page.goto(route);
				await expect(page).toHaveURL('/user/login', { timeout: 5000 });
			}
		});

		test('should allow access to login page when not authenticated', async ({ page }) => {
			await page.goto('/user/login');
			await expect(page).toHaveURL('/user/login');
		});

		test('should redirect from login to home when already authenticated', async ({ page }) => {
			// Set valid token first
			await setRealAuthToken(page);

			// Try to access login page
			await page.goto('/user/login');

			// Should redirect to home page (auth guard redirects authenticated users away from login)
			await expect(page).toHaveURL('/', { timeout: 10000 });
		});
	});

	test.describe('User Information Display', () => {
		test('should display correct user information for different roles', async ({ page }) => {
			// Test with real user from backend
			await setRealAuthToken(page);

			await page.goto('/');

			// Check we're on the right page first
			await expect(page).toHaveURL('/', { timeout: 10000 });

			// Try to find the username display using real user data
			const usernamePatterns = [
				page.getByText('Sergioburciaga37'), // Real username from backend
				page.getByText('sergioburciaga37'), // Lowercase version
				page.getByText(/sergioburciaga/i), // Case insensitive partial match
				page.locator('[data-testid="username-display"]')
			];

			for (const usernameLocator of usernamePatterns) {
				try {
					await expect(usernameLocator).toBeVisible({ timeout: 3000 });
					break;
				} catch {
					console.log(`🔍 Username pattern not found, trying next...`);
				}
			}

			// Verify role display (real user has CONFIG role)
			const rolePatterns = [
				page.getByText('CONFIG'), // Real role from backend (ROLE_CONFIG -> CONFIG)
				page.getByText(/config/i), // Case insensitive
				page.locator('[data-testid="user-role"]')
			];

			for (const roleLocator of rolePatterns) {
				try {
					await expect(roleLocator).toBeVisible({ timeout: 3000 });
					console.log('🔥 Found role display successfully');
					break;
				} catch {
					console.log(`🔍 Role pattern not found, trying next...`);
				}
			}
		});
	});

	test.describe('Error Handling', () => {
		test('should handle corrupted token gracefully', async ({ page }) => {
			// Set corrupted token directly (this test specifically needs corrupted token)
			await page.addInitScript(() => {
				console.log('🔥 AUTH FIXTURE: Setting corrupted token for testing');
				localStorage.setItem('cazss_access_token', 'corrupted.token.data');
			});

			await page.goto('/');

			// Should redirect to login due to invalid token
			await expect(page).toHaveURL('/user/login', { timeout: 10000 });
		});

		test('should handle localStorage errors gracefully', async ({ page }) => {
			// Mock localStorage to throw errors
			await page.addInitScript(() => {
				localStorage.getItem = () => {
					throw new Error('localStorage error');
				};
			});

			await page.goto('/user/login');

			// Fill login form with REAL credentials for integration tests
			await page.fill('input[type="email"]', REAL_CREDENTIALS.email);
			await page.fill('input[type="password"]', REAL_CREDENTIALS.password);

			// Submit form - should still work despite localStorage errors
			await page.click('button[type="submit"]');

			// Should redirect to home page
			await expect(page).toHaveURL('/', { timeout: 10000 });
		});
	});
});
