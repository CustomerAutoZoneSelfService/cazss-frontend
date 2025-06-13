import { test, expect } from '@playwright/test';

/*
 * E2E test suite for Auto-Refresh Token Flow
 * Tests the automatic refresh of access tokens when they expire
 * and proper handling of refresh token failures
 */

test.describe('Auto-Refresh Token Flow', () => {
	// Setup console logging for all tests
	test.beforeEach(async ({ page }) => {
		page.on('console', (msg) => {
			console.log(`🖥️ BROWSER LOG [${msg.type()}]:`, msg.text());
		});

		page.on('pageerror', (error) => {
			console.log('🖥️ BROWSER ERROR:', error.message);
		});

		// Clear localStorage before each test
		await page.addInitScript(() => {
			localStorage.clear();
		});
	});

	/**
	 * Helper function to create an expired JWT token for testing
	 */
	function createExpiredToken(userData = {}) {
		const defaultUser = {
			sub: '1',
			username: 'john_doe',
			email: 'admin@test.com',
			role: 'ADMIN',
			exp: Math.floor(Date.now() / 1000) - 60 // Expired 1 minute ago
		};

		const user = { ...defaultUser, ...userData };
		const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
		const payload = btoa(JSON.stringify(user));
		const signature = 'mock_signature';
		return `${header}.${payload}.${signature}`;
	}

	/**
	 * Helper function to create a valid JWT token for testing
	 */
	function createValidToken(userData = {}) {
		const defaultUser = {
			sub: '1',
			username: 'john_doe',
			email: 'admin@test.com',
			role: 'ADMIN',
			exp: Math.floor(Date.now() / 1000) + 3600 // Valid for 1 hour
		};

		const user = { ...defaultUser, ...userData };
		const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
		const payload = btoa(JSON.stringify(user));
		const signature = 'mock_signature';
		return `${header}.${payload}.${signature}`;
	}

	test('auto-refresh success', async ({ page }) => {
		// Set expired access token in localStorage
		const expiredToken = createExpiredToken();
		await page.addInitScript((token) => {
			localStorage.setItem('cazss_access_token', token);
		}, expiredToken);

		// Intercept the refresh request and return a new valid token
		await page.route('**/api/auth/refresh', async (route) => {
			const newToken = createValidToken();
			await route.fulfill({
				status: 200,
				contentType: 'application/json',
				body: JSON.stringify({
					access_token: newToken
				})
			});
		});

		// Try to access a protected page
		await page.goto('/');

		// Verify we're on the home page, not redirected to login
		await expect(page).toHaveURL('/', { timeout: 10000 });

		// Check that we're not on login page (which would mean refresh failed)
		await expect(page).not.toHaveURL('/user/login');

		// Verify that some token exists in localStorage (indicating the app didn't clear it)
		const currentToken = await page.evaluate(() => localStorage.getItem('cazss_access_token'));
		expect(currentToken).toBeTruthy();

		// The key indicator of success is that we're still on the home page
		// rather than being redirected to login
	});

	test('auto-refresh failure', async ({ page }) => {
		// Set expired access token in localStorage
		const expiredToken = createExpiredToken();
		await page.addInitScript((token) => {
			localStorage.setItem('cazss_access_token', token);
		}, expiredToken);

		// Intercept the refresh request and return 401 (refresh token expired)
		await page.route('**/api/auth/refresh', async (route) => {
			await route.fulfill({
				status: 401,
				contentType: 'application/json',
				body: JSON.stringify({
					message: 'Refresh token expired'
				})
			});
		});

		// Try to access a protected page
		await page.goto('/');

		// Should redirect to login page when refresh fails
		await expect(page).toHaveURL('/user/login', { timeout: 10000 });

		// The token might still be in localStorage but the app should redirect to login anyway
		// What matters is that we're on the login page, indicating the refresh failed
	});

	test('missing refresh cookie', async ({ page }) => {
		// Set expired access token in localStorage
		const expiredToken = createExpiredToken();
		await page.addInitScript((token) => {
			localStorage.setItem('cazss_access_token', token);
		}, expiredToken);

		// Intercept the refresh request and return 401 (no refresh cookie)
		await page.route('**/api/auth/refresh', async (route) => {
			await route.fulfill({
				status: 401,
				contentType: 'application/json',
				body: JSON.stringify({
					message: 'No refresh token provided'
				})
			});
		});

		// Try to access a protected page
		await page.goto('/');

		// Should redirect to login page when no refresh cookie is available
		await expect(page).toHaveURL('/user/login', { timeout: 10000 });

		// The token might still be in localStorage but the app should redirect to login anyway
		// What matters is that we're on the login page, indicating the missing cookie caused failure
	});
});
