import { writable } from 'svelte/store';

export interface User {
	user_id: string;
	username: string;
	email: string;
	role: 'ADMIN' | 'CONFIG' | 'AUDITOR' | 'USER';
}

// Global user store - holds decoded JWT information
export const user = writable<User | null>(null);

/**
 * Utility function to decode JWT payload with updated claims structure
 * @param token JWT access token string
 * @returns decoded user data or null if invalid
 */
export function decodeJWTUser(token: string): User | null {
	try {
		// JWT format: header.payload.signature
		const parts = token.split('.');
		if (parts.length !== 3) {
			return null;
		}

		// Decode payload (second part)
		const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));

		// Validate required fields for access token
		// Note: refresh tokens don't have email/role, so we only validate core fields
		if (!payload.sub || !payload.username) {
			return null;
		}

		// For access tokens, we expect email and role
		if (!payload.email || !payload.role) {
			console.warn('JWT payload missing email or role - this might be a refresh token');
			return null;
		}

		// Remove "ROLE_" prefix if present
		const cleanRole = payload.role.startsWith('ROLE_') ? payload.role.slice(5) : payload.role;

		return {
			user_id: payload.sub,
			username: payload.username,
			email: payload.email,
			role: cleanRole as 'ADMIN' | 'CONFIG' | 'AUDITOR' | 'USER'
		};
	} catch (error) {
		console.warn('Failed to decode JWT user data:', error);
		return null;
	}
}

/**
 * Clear user data from store
 */
export function clearUser() {
	user.set(null);
}
