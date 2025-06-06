import { describe, it, expect, beforeEach, afterEach, vi, type MockedFunction } from 'vitest';
import { ApiWrapper } from '../ApiWrapper';

// Polyfill for btoa/atob functions needed for JWT handling in all test environments
if (typeof btoa === 'undefined') {
	global.btoa = (str: string) => Buffer.from(str, 'binary').toString('base64');
}

if (typeof atob === 'undefined') {
	global.atob = (str: string) => Buffer.from(str, 'base64').toString('binary');
}

// Mock fetch globally
const mockFetch = vi.fn() as MockedFunction<typeof fetch>;
global.fetch = mockFetch;

// Helper function to create a valid JWT access token
function createTestJWT(payload: object, expiresInSeconds = 3600): string {
	const header = { alg: 'HS256', typ: 'JWT' };
	const encodedHeader = btoa(JSON.stringify(header));
	const tokenPayload = {
		...payload,
		exp: Math.floor(Date.now() / 1000) + expiresInSeconds,
		iat: Math.floor(Date.now() / 1000)
	};
	const encodedPayload = btoa(JSON.stringify(tokenPayload));
	const signature = 'test-signature';
	return `${encodedHeader}.${encodedPayload}.${signature}`;
}

// Helper function to create an expired JWT token
function createExpiredJWT(payload: object): string {
	const header = { alg: 'HS256', typ: 'JWT' };
	const encodedHeader = btoa(JSON.stringify(header));
	const tokenPayload = {
		...payload,
		exp: Math.floor(Date.now() / 1000) - 3600, // Expired 1 hour ago
		iat: Math.floor(Date.now() / 1000) - 7200 // Issued 2 hours ago
	};
	const encodedPayload = btoa(JSON.stringify(tokenPayload));
	const signature = 'test-signature';
	return `${encodedHeader}.${encodedPayload}.${signature}`;
}

describe('ApiWrapper', () => {
	let apiWrapper: ApiWrapper;

	beforeEach(() => {
		vi.clearAllMocks();
		// Mock localStorage for each test
		const mockLocalStorage = {
			getItem: vi.fn(),
			setItem: vi.fn(),
			removeItem: vi.fn(),
			clear: vi.fn()
		};

		Object.defineProperty(global, 'localStorage', {
			writable: true,
			value: mockLocalStorage
		});

		// Create a fresh instance for each test
		apiWrapper = new ApiWrapper('http://test-api.com');
	});

	afterEach(() => {
		vi.clearAllMocks();
	});

	describe('Token Management', () => {
		it('should initialize without tokens', () => {
			expect(apiWrapper.getToken()).toBeNull();
			expect(apiWrapper.getRefreshToken()).toBeNull();
		});

		it('should set and get a valid token', () => {
			const token = createTestJWT({ sub: '123' });

			apiWrapper.setToken(token);

			expect(apiWrapper.getToken()).toBe(token);
			expect(global.localStorage.setItem).toHaveBeenCalledWith('cazss_access_token', token);
		});

		it('should throw error when setting invalid token format', () => {
			expect(() => {
				apiWrapper.setToken('invalid-token');
			}).toThrow('Invalid JWT access token format');
		});

		it('should clear both tokens from memory and localStorage', () => {
			const accessToken = createTestJWT({ sub: '123' });
			apiWrapper.setToken(accessToken);

			// Mock refresh token in localStorage (since we can't directly set private refreshToken)
			global.localStorage.getItem = vi
				.fn()
				.mockReturnValueOnce(accessToken) // First call for access token
				.mockReturnValueOnce(createTestJWT({ sub: '123' }, 86400)); // Second call for refresh token

			// Reinitialize to load refresh token
			const newApiWrapper = new ApiWrapper('http://test-api.com');

			newApiWrapper.clearToken();

			expect(newApiWrapper.getToken()).toBeNull();
			expect(newApiWrapper.getRefreshToken()).toBeNull();
			expect(global.localStorage.removeItem).toHaveBeenCalledWith('cazss_access_token');
			expect(global.localStorage.removeItem).toHaveBeenCalledWith('cazss_refresh_token');
		});

		it('should handle localStorage errors gracefully when setting token', () => {
			const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
			global.localStorage.setItem = vi.fn().mockImplementation(() => {
				throw new Error('localStorage error');
			});

			const token = createTestJWT({ sub: '123' });

			expect(() => apiWrapper.setToken(token)).not.toThrow();
			expect(apiWrapper.getToken()).toBe(token);
			expect(consoleSpy).toHaveBeenCalledWith(
				'Failed to save access token to localStorage:',
				expect.any(Error)
			);

			consoleSpy.mockRestore();
		});

		it('should handle localStorage errors gracefully when clearing token', () => {
			const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
			global.localStorage.removeItem = vi.fn().mockImplementation(() => {
				throw new Error('localStorage error');
			});

			expect(() => apiWrapper.clearToken()).not.toThrow();
			expect(consoleSpy).toHaveBeenCalledWith(
				'Failed to clear tokens from localStorage:',
				expect.any(Error)
			);

			consoleSpy.mockRestore();
		});
	});

	describe('Token Expiration', () => {
		it('should correctly identify non-expired tokens', () => {
			const token = createTestJWT({ sub: '123' }, 3600); // Expires in 1 hour

			expect(apiWrapper.isTokenExpired(token)).toBe(false);
		});

		it('should correctly identify expired tokens', () => {
			const expiredToken = createExpiredJWT({ sub: '123' });

			expect(apiWrapper.isTokenExpired(expiredToken)).toBe(true);
		});

		it('should treat null token as expired', () => {
			expect(apiWrapper.isTokenExpired(null)).toBe(true);
		});

		it('should treat empty string as expired', () => {
			expect(apiWrapper.isTokenExpired('')).toBe(true);
		});

		it('should treat malformed token as expired', () => {
			expect(apiWrapper.isTokenExpired('invalid-token')).toBe(true);
		});

		it('should check current token when no parameter provided', () => {
			// No token set - should be expired
			expect(apiWrapper.isTokenExpired()).toBe(true);

			// Set valid token
			const validToken = createTestJWT({ sub: '123' });
			apiWrapper.setToken(validToken);
			expect(apiWrapper.isTokenExpired()).toBe(false);

			// Set expired token
			const expiredToken = createExpiredJWT({ sub: '123' });
			apiWrapper.setToken(expiredToken);
			expect(apiWrapper.isTokenExpired()).toBe(true);
		});
	});

	describe('Initialization from localStorage', () => {
		it('should load both valid tokens from localStorage on instantiation', () => {
			const accessToken = createTestJWT({ sub: '123' });
			const refreshToken = createTestJWT({ sub: '123' }, 86400);

			global.localStorage.getItem = vi
				.fn()
				.mockReturnValueOnce(accessToken) // First call for access token
				.mockReturnValueOnce(refreshToken); // Second call for refresh token

			const newApiWrapper = new ApiWrapper();

			expect(newApiWrapper.getToken()).toBe(accessToken);
			expect(newApiWrapper.getRefreshToken()).toBe(refreshToken);
		});

		it('should clear both tokens if either is expired on instantiation', () => {
			const validToken = createTestJWT({ sub: '123' });
			const expiredToken = createExpiredJWT({ sub: '123' });

			global.localStorage.getItem = vi
				.fn()
				.mockReturnValueOnce(validToken) // Access token (valid)
				.mockReturnValueOnce(expiredToken); // Refresh token (expired)

			const newApiWrapper = new ApiWrapper();

			expect(newApiWrapper.getToken()).toBeNull();
			expect(newApiWrapper.getRefreshToken()).toBeNull();
			expect(global.localStorage.removeItem).toHaveBeenCalledWith('cazss_access_token');
			expect(global.localStorage.removeItem).toHaveBeenCalledWith('cazss_refresh_token');
		});

		it('should handle localStorage access errors during initialization', () => {
			const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
			global.localStorage.getItem = vi.fn().mockImplementation(() => {
				throw new Error('localStorage error');
			});

			expect(() => new ApiWrapper()).not.toThrow();
			expect(consoleSpy).toHaveBeenCalledWith(
				'Failed to initialize tokens from localStorage:',
				expect.any(Error)
			);

			consoleSpy.mockRestore();
		});

		it('should ignore null token from localStorage', () => {
			global.localStorage.getItem = vi.fn().mockReturnValue(null);

			const newApiWrapper = new ApiWrapper();

			expect(newApiWrapper.getToken()).toBeNull();
		});
	});

	describe('HTTP Authorization Headers', () => {
		it('should include Authorization header with valid token', async () => {
			const token = createTestJWT({ sub: '123' });
			apiWrapper.setToken(token);

			mockFetch.mockResolvedValueOnce({
				ok: true,
				json: () => Promise.resolve({ data: 'test' })
			} as Response);

			await apiWrapper.get('/test');

			expect(mockFetch).toHaveBeenCalledWith(
				'http://test-api.com/test',
				expect.objectContaining({
					headers: expect.objectContaining({
						Authorization: `Bearer ${token}`
					})
				})
			);
		});

		it('should not include Authorization header without token', async () => {
			mockFetch.mockResolvedValueOnce({
				ok: true,
				json: () => Promise.resolve({ data: 'test' })
			} as Response);

			await apiWrapper.get('/test');

			expect(mockFetch).toHaveBeenCalledWith(
				'http://test-api.com/test',
				expect.objectContaining({
					headers: expect.not.objectContaining({
						Authorization: expect.any(String)
					})
				})
			);
		});

		it('should not include Authorization header with expired token', async () => {
			const expiredToken = createExpiredJWT({ sub: '123' });
			apiWrapper.setToken(expiredToken);

			mockFetch.mockResolvedValueOnce({
				ok: true,
				json: () => Promise.resolve({ data: 'test' })
			} as Response);

			await apiWrapper.get('/test');

			expect(mockFetch).toHaveBeenCalledWith(
				'http://test-api.com/test',
				expect.objectContaining({
					headers: expect.not.objectContaining({
						Authorization: expect.any(String)
					})
				})
			);
		});

		it('should clear token on 401 unauthorized response', async () => {
			const token = createTestJWT({ sub: '123' });
			apiWrapper.setToken(token);

			mockFetch.mockResolvedValueOnce({
				ok: false,
				status: 401,
				statusText: 'Unauthorized',
				text: () => Promise.resolve('Unauthorized')
			} as Response);

			await expect(apiWrapper.get('/test')).rejects.toThrow();
			expect(apiWrapper.getToken()).toBeNull();
			expect(global.localStorage.removeItem).toHaveBeenCalledWith('cazss_access_token');
		});
	});

	describe('Login Method', () => {
		it('should login successfully in production mode', async () => {
			// Mock production environment
			vi.stubEnv('MODE', 'production');

			const accessToken = createTestJWT({ sub: '123', email: 'test@example.com' });
			const refreshToken = createTestJWT({ sub: '123', username: 'test_user' }, 86400);

			mockFetch.mockResolvedValueOnce({
				ok: true,
				json: () =>
					Promise.resolve({
						message: 'Login successful!',
						accessToken: accessToken,
						refreshToken: refreshToken
					})
			} as Response);

			const result = await apiWrapper.login('test@example.com', 'password');

			expect(result.accessToken).toBe(accessToken);
			expect(result.refreshToken).toBe(refreshToken);
			expect(apiWrapper.getToken()).toBe(accessToken);
			expect(mockFetch).toHaveBeenCalledWith(
				'http://test-api.com/api/auth/login',
				expect.objectContaining({
					method: 'POST',
					headers: expect.objectContaining({
						'Content-Type': 'application/json'
					}),
					body: JSON.stringify({ email: 'test@example.com', password: 'password' })
				})
			);
		});

		it('should handle login failure in production mode', async () => {
			// Mock production environment
			vi.stubEnv('MODE', 'production');

			const token = createTestJWT({ sub: '123' });
			apiWrapper.setToken(token); // Set a token that should be cleared on failure

			mockFetch.mockResolvedValueOnce({
				ok: false,
				status: 401,
				statusText: 'Unauthorized',
				text: () => Promise.resolve('Invalid credentials')
			} as Response);

			await expect(apiWrapper.login('test@example.com', 'wrong-password')).rejects.toThrow();
			expect(apiWrapper.getToken()).toBeNull(); // Token should be cleared on failure
		});

		it('should create mock tokens in development mode', async () => {
			// Mock development environment
			vi.stubEnv('MODE', 'development');

			// Apply JWT mock for this test specifically
			const { addJWTMockToApiWrapper } = await import('../mockApiWrapper');
			addJWTMockToApiWrapper(apiWrapper);

			const result = await apiWrapper.login('test@example.com', 'password');

			expect(result.accessToken).toBeDefined();
			expect(result.refreshToken).toBeDefined();
			expect(apiWrapper.getToken()).toBe(result.accessToken);
			expect(apiWrapper.isTokenExpired()).toBe(false);

			// Should not call fetch in development mode
			expect(mockFetch).not.toHaveBeenCalled();
		});

		it('should handle invalid token response in production mode', async () => {
			// Mock production environment
			vi.stubEnv('MODE', 'production');

			mockFetch.mockResolvedValueOnce({
				ok: true,
				json: () =>
					Promise.resolve({
						message: 'Login successful!',
						accessToken: 'invalid-token-format',
						refreshToken: 'also-invalid'
					})
			} as Response);

			await expect(apiWrapper.login('test@example.com', 'password')).rejects.toThrow(
				'Invalid access token received from server'
			);
		});
	});

	// HTTP Method Tests
	describe('HTTP Methods', () => {
		it('should make GET request', async () => {
			mockFetch.mockResolvedValueOnce({
				ok: true,
				json: () => Promise.resolve({ data: 'test' })
			} as Response);

			const result = await apiWrapper.get('/test');

			expect(result).toEqual({ data: 'test' });
			expect(mockFetch).toHaveBeenCalledWith(
				'http://test-api.com/test',
				expect.objectContaining({
					method: 'GET'
				})
			);
		});

		it('should make POST request with body', async () => {
			mockFetch.mockResolvedValueOnce({
				ok: true,
				json: () => Promise.resolve({ created: true })
			} as Response);

			const requestBody = { name: 'test' };
			const result = await apiWrapper.post('/test', requestBody);

			expect(result).toEqual({ created: true });
			expect(mockFetch).toHaveBeenCalledWith(
				'http://test-api.com/test',
				expect.objectContaining({
					method: 'POST',
					headers: expect.objectContaining({
						'Content-Type': 'application/json'
					}),
					body: JSON.stringify(requestBody)
				})
			);
		});
	});
});
