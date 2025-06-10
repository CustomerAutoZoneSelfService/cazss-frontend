import { browser } from '$app/environment';
import { user, decodeJWTUser, clearUser } from '$lib/stores/user';

// Flag to prevent multiple simultaneous auth checks
let authCheckInProgress = false;

/**
 * Client-side authentication guard with refresh token support
 * Runs on every page load to check token validity and redirect if necessary
 * Now attempts token refresh before forcing logout
 */
export async function handleClientError() {
	// Only run in browser environment
	if (!browser || authCheckInProgress) return;

	authCheckInProgress = true;

	try {
		// Check current path
		const currentPath = window.location.pathname;

		// Use dynamic import to avoid hot module reloading issues
		const { api } = await import('$lib/ApiWrapper');

		// Check if access token exists and is valid
		const currentToken = api.getToken();
		const hasValidToken = currentToken && !api.isTokenExpired();

		// Handle authenticated users trying to access login page
		if (currentPath.startsWith('/user/login') && hasValidToken) {
			// User is already authenticated, redirect to home
			const userData = decodeJWTUser(currentToken);
			if (userData) {
				user.set(userData);
				window.location.replace('/');
				return;
			}
		}

		// Handle other auth pages (non-login) - clear user data
		if (currentPath.startsWith('/user/') && !currentPath.startsWith('/user/login')) {
			clearUser();
			return;
		}

		// Handle login page without valid token - clear user data and allow access
		if (currentPath.startsWith('/user/login') && !hasValidToken) {
			clearUser();
			return;
		}

		// Handle protected pages (non-auth pages)
		if (!currentPath.startsWith('/user/')) {
			if (!hasValidToken) {
				// Token is expired or missing - try to refresh before redirecting
				if (currentToken && api.isTokenExpired(currentToken)) {
					try {
						// Attempt to refresh the access token using the refresh token
						const refreshedToken = await attemptTokenRefresh(api);
						if (refreshedToken) {
							// Successfully refreshed, decode and populate user store
							const userData = decodeJWTUser(refreshedToken);
							if (userData) {
								user.set(userData);
								return; // Stay on current page
							}
						}
					} catch (refreshError) {
						console.warn('Token refresh failed during auth guard:', refreshError);
						// Fall through to logout
					}
				}

				// No valid token and refresh failed/not possible, clear user data and redirect to login
				clearUser();
				api.clearToken();
				window.location.replace('/user/login');
				return;
			}

			// Token is valid, decode and populate user store
			if (currentToken) {
				const userData = decodeJWTUser(currentToken);
				if (userData) {
					user.set(userData);
				} else {
					// Token exists but couldn't decode user data - treat as invalid
					clearUser();
					api.clearToken();
					window.location.replace('/user/login');
					return;
				}
			}
		}
	} catch (error) {
		console.error('Auth guard error:', error);
		// Fallback: clear user data and redirect to login on any error
		clearUser();
		try {
			const { api } = await import('$lib/ApiWrapper');
			api.clearToken();
		} catch (apiError) {
			console.warn('Failed to clear token during error fallback:', apiError);
		}
		window.location.replace('/user/login');
	} finally {
		authCheckInProgress = false;
	}
}

/**
 * Attempt to refresh access token using the refresh token
 * @param api - ApiWrapper instance
 * @returns Promise resolving to new access token or null if failed
 */
async function attemptTokenRefresh(api: {
	request: (url: string, options: { method: string }) => Promise<unknown>;
	getToken: () => string | null;
	isTokenExpired: (token?: string | null) => boolean;
}): Promise<string | null> {
	try {
		// Make a dummy request that will trigger the refresh logic in ApiWrapper
		// We use a lightweight endpoint or create a dedicated refresh method
		await api.request('/api/auth/refresh', {
			method: 'POST'
		});

		// If successful, get the new token
		const newToken = api.getToken();
		return newToken && !api.isTokenExpired(newToken) ? newToken : null;
	} catch {
		// Refresh failed
		return null;
	}
}

// Auto-run the auth guard when the module loads
if (browser) {
	handleClientError();
}
