import { test as base, expect } from '@playwright/test';

interface UserData {
	user_id?: number;
	username?: string;
	email?: string;
	role?: string;
	[key: string]: unknown;
}

// Helper to create dummy JWT tokens
export function createDummyJWT(userData: UserData = {}) {
	const defaultUserData: UserData = {
		user_id: 1,
		username: 'John Doe',
		email: 'admin@test.com',
		role: 'ADMIN'
	};

	const payload = {
		...defaultUserData,
		...userData,
		exp: Math.floor(Date.now() / 1000) + 86400, // 24 hours from now
		iat: Math.floor(Date.now() / 1000)
	};

	const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64');
	const encodedPayload = Buffer.from(JSON.stringify(payload)).toString('base64');
	const signature = Buffer.from('dummy-signature').toString('base64');

	return `${header}.${encodedPayload}.${signature}`;
}

// Helper to create expired JWT token
export function createExpiredJWT(payload: UserData): string {
	const expiredPayload = {
		...payload,
		exp: Math.floor(Date.now() / 1000) - 3600, // Expired 1 hour ago
		iat: Math.floor(Date.now() / 1000) - 7200
	};

	const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64');
	const encodedPayload = Buffer.from(JSON.stringify(expiredPayload)).toString('base64');
	const signature = 'test-signature';

	return `${header}.${encodedPayload}.${signature}`;
}

// Mock login helper
export async function mockLogin(
	page: import('@playwright/test').Page,
	shouldSucceed: boolean = true,
	userData: UserData = {}
) {
	await page.route('**/api/auth/login', (route) => {
		const request = route.request();
		const body = request.postDataJSON() as { email?: string; password?: string };
		const email = body?.email || 'admin@test.com';

		if (
			!shouldSucceed ||
			email.includes('invalid') ||
			email.includes('fail') ||
			(email === 'admin@test.com' && body?.password !== 'admin123') ||
			(email === 'user@example.com' && body?.password !== 'password123') ||
			(email === 'test@example.com' && body?.password !== 'validpass')
		) {
			route.fulfill({
				status: 401,
				contentType: 'application/json',
				body: JSON.stringify({ message: 'Invalid credentials' })
			});
			return;
		}

		// Create JWT token based on email for successful login
		const defaultUserData: UserData = {
			email,
			username:
				email === 'admin@test.com'
					? 'John Doe'
					: email === 'pedro@test.com'
						? 'Alberto Pedro Gonzales'
						: email === 'user@example.com'
							? 'Jane Smith'
							: 'User Name',
			role: email === 'admin@test.com' ? 'ADMIN' : 'USER'
		};

		const accessToken = createDummyJWT({ ...defaultUserData, ...userData });
		const refreshToken = createDummyJWT({
			user_id: defaultUserData.user_id,
			username: defaultUserData.username
		});

		route.fulfill({
			status: 200,
			contentType: 'application/json',
			body: JSON.stringify({
				message: 'Login successful!',
				accessToken,
				refreshToken
			})
		});
	});
}

// Setup API mocks
export async function setupApiMocks(page: import('@playwright/test').Page) {
	// Handle services endpoint
	await page.route('**/services*', (route) => {
		route.fulfill({
			status: 200,
			contentType: 'application/json',
			body: JSON.stringify([
				{ endpointId: 1, name: 'getById', description: 'Example description' },
				{ endpointId: 2, name: 'getByName', description: 'Example description 2' }
			])
		});
	});

	// Handle other API calls
	await page.route('**/api/**', (route) => {
		route.fulfill({
			status: 200,
			contentType: 'application/json',
			body: JSON.stringify({ success: true })
		});
	});
}

// Extended test with authenticated context
export const test = base.extend<{
	authenticatedPage: import('@playwright/test').Page;
}>({
	authenticatedPage: async ({ page }, use) => {
		// Set up logging
		page.on('console', (msg) => {
			console.log(`🖥️ AUTH PAGE LOG [${msg.type()}]:`, msg.text());
		});

		page.on('pageerror', (error) => {
			console.log('🖥️ AUTH PAGE ERROR:', error.message);
		});

		// Clear any existing localStorage first
		await page.addInitScript(() => {
			localStorage.clear();
		});

		// Set up mocks BEFORE navigation
		await mockLogin(page, true);
		await setupApiMocks(page);

		// Create and inject a valid access token DIRECTLY
		const validToken = createDummyJWT({
			user_id: 1,
			username: 'John Doe',
			email: 'admin@test.com',
			role: 'ADMIN'
		});

		// Create refresh token for complete auth setup
		const validRefreshToken = createDummyJWT({
			user_id: 1,
			username: 'John Doe'
			// No email/role in refresh token
		});

		// Inject both tokens into localStorage
		await page.addInitScript(
			(tokens) => {
				console.log('🔥 AUTH FIXTURE: Setting tokens in localStorage with correct keys');

				// Set both tokens that ApiWrapper uses
				localStorage.setItem('cazss_access_token', tokens.access);
				localStorage.setItem('cazss_refresh_token', tokens.refresh);

				console.log('🔥 AUTH FIXTURE: Both tokens set in localStorage');
			},
			{ access: validToken, refresh: validRefreshToken }
		);

		await use(page);
	}
});

export { expect };
