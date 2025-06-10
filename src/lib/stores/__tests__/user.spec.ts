/**
 * @vitest-environment jsdom
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { get } from 'svelte/store';
import { user, decodeJWTUser, clearUser, type User } from '../user';

// Polyfill for btoa function needed for JWT handling in test environment
if (typeof btoa === 'undefined') {
	global.btoa = (str: string) => Buffer.from(str, 'binary').toString('base64');
}

if (typeof atob === 'undefined') {
	global.atob = (str: string) => Buffer.from(str, 'base64').toString('binary');
}

describe('User Store', () => {
	beforeEach(() => {
		// Clear the store before each test
		clearUser();
	});

	describe('Store Operations', () => {
		it('should initialize with null value', () => {
			expect(get(user)).toBeNull();
		});

		it('should set user data correctly', () => {
			const mockUser: User = {
				user_id: '1',
				username: 'test_user',
				email: 'test@example.com',
				role: 'USER'
			};

			user.set(mockUser);
			expect(get(user)).toEqual(mockUser);
		});

		it('should clear user data', () => {
			const mockUser: User = {
				user_id: '1',
				username: 'test_user',
				email: 'test@example.com',
				role: 'USER'
			};

			user.set(mockUser);
			clearUser();
			expect(get(user)).toBeNull();
		});

		it('should be reactive to changes', () => {
			const values: (User | null)[] = [];

			// Subscribe to store changes
			const unsubscribe = user.subscribe((value) => {
				values.push(value);
			});

			// Initial value should be null
			expect(values[0]).toBeNull();

			// Set user
			const mockUser: User = {
				user_id: '1',
				username: 'test_user',
				email: 'test@example.com',
				role: 'USER'
			};
			user.set(mockUser);
			expect(values[1]).toEqual(mockUser);

			// Clear user
			clearUser();
			expect(values[2]).toBeNull();

			unsubscribe();
		});
	});

	describe('JWT Decoding', () => {
		it('should decode valid JWT with user data', () => {
			const payload = {
				sub: '123', // Use 'sub' instead of 'user_id'
				username: 'john_doe',
				email: 'john@example.com',
				role: 'ADMIN', // Backend no longer sends ROLE_ prefix
				exp: Math.floor(Date.now() / 1000) + 3600,
				iat: Math.floor(Date.now() / 1000)
			};

			const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
			const encodedPayload = btoa(JSON.stringify(payload));
			const signature = 'dummy-signature';
			const token = `${header}.${encodedPayload}.${signature}`;

			const result = decodeJWTUser(token);

			expect(result).toEqual({
				user_id: '123', // Expect string instead of number
				username: 'john_doe',
				email: 'john@example.com',
				role: 'ADMIN' // No prefix to remove
			});
		});

		it('should return null for malformed JWT', () => {
			const invalidTokens = [
				'invalid-token',
				'header.payload', // Missing signature
				'', // Empty string
				'a.b.c.d' // Too many parts
			];

			invalidTokens.forEach((token) => {
				expect(decodeJWTUser(token)).toBeNull();
			});
		});

		it('should return null for JWT with missing required fields', () => {
			const incompletePayloads = [
				{ sub: '1', username: 'test', email: 'test@example.com' }, // Missing role
				{ sub: '1', username: 'test', role: 'USER' }, // Missing email
				{ sub: '1', email: 'test@example.com', role: 'USER' }, // Missing username
				{ username: 'test', email: 'test@example.com', role: 'USER' } // Missing sub
			];

			incompletePayloads.forEach((payload) => {
				const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
				const encodedPayload = btoa(JSON.stringify(payload));
				const signature = 'dummy-signature';
				const token = `${header}.${encodedPayload}.${signature}`;

				expect(decodeJWTUser(token)).toBeNull();
			});
		});

		it('should handle different user roles correctly', () => {
			const roles: Array<'ADMIN' | 'CONFIG' | 'AUDITOR' | 'USER'> = [
				'ADMIN',
				'CONFIG',
				'AUDITOR',
				'USER'
			];

			roles.forEach((role) => {
				const payload = {
					sub: '1', // Use 'sub' instead of 'user_id'
					username: 'test_user',
					email: 'test@example.com',
					role: role, // Backend no longer sends ROLE_ prefix
					exp: Math.floor(Date.now() / 1000) + 3600,
					iat: Math.floor(Date.now() / 1000)
				};

				const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
				const encodedPayload = btoa(JSON.stringify(payload));
				const signature = 'dummy-signature';
				const token = `${header}.${encodedPayload}.${signature}`;

				const result = decodeJWTUser(token);

				expect(result?.role).toBe(role); // No prefix to remove
			});
		});

		it('should handle JSON parsing errors gracefully', () => {
			// Create a token with invalid JSON in payload
			const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
			const invalidPayload = 'invalid-json';
			const signature = 'dummy-signature';
			const token = `${header}.${invalidPayload}.${signature}`;

			const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

			const result = decodeJWTUser(token);

			expect(result).toBeNull();
			expect(consoleSpy).toHaveBeenCalledWith('Failed to decode JWT user data:', expect.any(Error));

			consoleSpy.mockRestore();
		});

		it('should extract user data with extra fields in payload', () => {
			const payload = {
				sub: '456', // Use 'sub' instead of 'user_id'
				username: 'admin_user',
				email: 'admin@test.com',
				role: 'ADMIN', // Backend no longer sends ROLE_ prefix
				exp: Math.floor(Date.now() / 1000) + 3600,
				iat: Math.floor(Date.now() / 1000),
				// Extra fields that should be ignored
				extraField: 'should-be-ignored',
				permissions: ['read', 'write', 'admin'],
				lastLogin: '2024-01-01T00:00:00Z'
			};

			const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
			const encodedPayload = btoa(JSON.stringify(payload));
			const signature = 'dummy-signature';
			const token = `${header}.${encodedPayload}.${signature}`;

			const result = decodeJWTUser(token);

			// Should only extract the required fields
			expect(result).toEqual({
				user_id: '456', // Expect string
				username: 'admin_user',
				email: 'admin@test.com',
				role: 'ADMIN' // No prefix to remove
			});
		});
	});

	describe('Type Safety', () => {
		it('should enforce correct User interface', () => {
			// This test ensures TypeScript type checking works correctly
			const validUser: User = {
				user_id: '1', // Now string
				username: 'test',
				email: 'test@example.com',
				role: 'USER'
			};

			user.set(validUser);
			expect(get(user)).toEqual(validUser);

			// TypeScript should prevent invalid roles at compile time
			// But we can test runtime behavior
			const invalidRolePayload = {
				sub: '1',
				username: 'test',
				email: 'test@example.com',
				role: 'INVALID_ROLE' // This would be caught by TypeScript but let's test runtime
			};

			const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
			const encodedPayload = btoa(JSON.stringify(invalidRolePayload));
			const signature = 'dummy-signature';
			const token = `${header}.${encodedPayload}.${signature}`;

			// Should still decode since we're not validating role values at runtime
			const result = decodeJWTUser(token);
			expect(result?.role).toBe('INVALID_ROLE');
		});
	});
});
