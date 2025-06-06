import type {
	Service,
	DetailedService,
	HistoryService,
	DetailedHistoryService
} from './types/ApiWrapper';
import type { RequestService } from './types/RequestService';
import type { ServiceResponse } from './types/ServiceResponse';
import { browser } from '$app/environment';

// Use environment variable for base URL, fallback to localhost for development
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

/**
 * JWT authentication payload interface with updated claims
 */
interface JWTPayload {
	sub: string; // user_id as string (standard JWT claim)
	username: string;
	email?: string; // Only in access_token
	role?: string; // Only in access_token
	exp: number; // Expiration timestamp in seconds
	iat: number; // Issued at timestamp
	[key: string]: unknown;
}

/**
 * Login response interface (updated for backend camelCase format)
 */
interface LoginResponse {
	message: string;
	accessToken: string;
	refreshToken: string;
}

/**
 * Refresh response interface (updated for backend camelCase format)
 */
interface RefreshResponse {
	message: string;
	accessToken: string;
	refreshToken: string;
}

/**
 * ApiWrapper class with JWT authentication support using accessToken + refreshToken
 *
 * Features:
 * - JWT accessToken management with localStorage persistence (short-lived)
 * - Refresh token management in memory (long-lived)
 * - Automatic token refresh on 401 responses
 * - Automatic Authorization header injection
 * - Singleton pattern for app-wide usage
 */
export class ApiWrapper {
	private accessToken: string | null = null;
	private refreshToken: string | null = null;
	private readonly ACCESS_TOKEN_STORAGE_KEY = 'cazss_access_token';
	private readonly REFRESH_TOKEN_STORAGE_KEY = 'cazss_refresh_token';
	private isRefreshing = false;
	private refreshPromise: Promise<string> | null = null;

	constructor(
		private baseUrl: string = BASE_URL,
		private headers: Record<string, string> = {}
	) {
		// Initialize both tokens from localStorage on instantiation
		this.initializeTokens();
	}

	/**
	 * Initialize both tokens from localStorage with expiration check
	 */
	private initializeTokens(): void {
		try {
			const storedAccessToken = localStorage.getItem(this.ACCESS_TOKEN_STORAGE_KEY);
			const storedRefreshToken = localStorage.getItem(this.REFRESH_TOKEN_STORAGE_KEY);

			// Check if access token is valid and not expired
			if (storedAccessToken && !this.isTokenExpired(storedAccessToken)) {
				this.setAccessToken(storedAccessToken);
			}

			// Check if refresh token is valid and not expired
			if (storedRefreshToken && !this.isTokenExpired(storedRefreshToken)) {
				this.setRefreshToken(storedRefreshToken);
			}

			// If either token is expired, clear both for security
			if (
				(storedAccessToken && this.isTokenExpired(storedAccessToken)) ||
				(storedRefreshToken && this.isTokenExpired(storedRefreshToken))
			) {
				this.clearTokens();
			}
		} catch (error) {
			// localStorage might not be available (SSR, tests without mock)
			console.warn('Failed to initialize tokens from localStorage:', error);
		}
	}

	/**
	 * Set access token and persist to localStorage
	 * @param token - JWT access token string
	 */
	private setAccessToken(token: string): void {
		if (!this.isValidJWTFormat(token)) {
			throw new Error('Invalid JWT access token format');
		}

		this.accessToken = token;
		try {
			localStorage.setItem(this.ACCESS_TOKEN_STORAGE_KEY, token);
		} catch (error) {
			console.warn('Failed to save access token to localStorage:', error);
		}
	}

	/**
	 * Set refresh token and persist to localStorage
	 * @param token - JWT refresh token string
	 */
	private setRefreshToken(token: string): void {
		if (!this.isValidJWTFormat(token)) {
			throw new Error('Invalid JWT refresh token format');
		}

		this.refreshToken = token;
		try {
			localStorage.setItem(this.REFRESH_TOKEN_STORAGE_KEY, token);
		} catch (error) {
			console.warn('Failed to save refresh token to localStorage:', error);
		}
	}

	/**
	 * Get current JWT access token
	 * @returns Current access token or null if not set
	 */
	public getToken(): string | null {
		return this.accessToken;
	}

	/**
	 * Get current JWT refresh token
	 * @returns Current refresh token or null if not set
	 */
	public getRefreshToken(): string | null {
		return this.refreshToken;
	}

	/**
	 * Clear both tokens from memory and localStorage
	 */
	public clearToken(): void {
		this.clearTokens();
	}

	/**
	 * Clear both JWT tokens from memory and localStorage
	 */
	private clearTokens(): void {
		this.accessToken = null;
		this.refreshToken = null;
		try {
			localStorage.removeItem(this.ACCESS_TOKEN_STORAGE_KEY);
			localStorage.removeItem(this.REFRESH_TOKEN_STORAGE_KEY);
		} catch (error) {
			console.warn('Failed to clear tokens from localStorage:', error);
		}
	}

	/**
	 * Set access token (public method for testing purposes)
	 * @param token - JWT access token string
	 */
	public setToken(token: string): void {
		this.setAccessToken(token);
	}

	/**
	 * Check if a JWT token is expired
	 * @param token - Token to check (optional, uses current access token if not provided)
	 * @returns true if token is expired, false otherwise
	 */
	public isTokenExpired(token?: string | null): boolean {
		const tokenToCheck = token || this.accessToken;
		if (!tokenToCheck) return true;

		try {
			const payload = this.decodeJWTPayload(tokenToCheck);
			const currentTime = Math.floor(Date.now() / 1000);
			return payload.exp < currentTime;
		} catch {
			// If we can't decode the token, consider it expired
			return true;
		}
	}

	/**
	 * Validate JWT token format (basic check for three parts separated by dots)
	 * @param token - Token to validate
	 * @returns true if format is valid
	 */
	private isValidJWTFormat(token: string): boolean {
		return typeof token === 'string' && token.split('.').length === 3;
	}

	/**
	 * Decode JWT payload without verification (client-side only)
	 * @param token - JWT token to decode
	 * @returns Decoded payload
	 */
	private decodeJWTPayload(token: string): JWTPayload {
		const parts = token.split('.');
		if (parts.length !== 3) {
			throw new Error('Invalid JWT format');
		}

		try {
			// Decode base64url payload
			const payload = atob(parts[1].replace(/-/g, '+').replace(/_/g, '/'));
			return JSON.parse(payload) as JWTPayload;
		} catch {
			throw new Error('Failed to decode JWT payload');
		}
	}

	/**
	 * Get authorization headers if access token is available and valid
	 * @returns Headers object with Authorization header if token is valid
	 */
	private getAuthHeaders(): Record<string, string> {
		if (this.accessToken && !this.isTokenExpired()) {
			return { Authorization: `Bearer ${this.accessToken}` };
		}
		return {};
	}

	/**
	 * Refresh access token using refresh token stored in localStorage
	 * @returns Promise resolving to new access token
	 */
	private async refreshAccessToken(): Promise<string> {
		// Prevent multiple concurrent refresh attempts
		if (this.isRefreshing && this.refreshPromise) {
			return this.refreshPromise;
		}

		this.isRefreshing = true;
		this.refreshPromise = this.performRefresh();

		try {
			const newAccessToken = await this.refreshPromise;
			return newAccessToken;
		} finally {
			this.isRefreshing = false;
			this.refreshPromise = null;
		}
	}

	/**
	 * Perform the actual refresh request
	 * @returns Promise resolving to new access token
	 */
	private async performRefresh(): Promise<string> {
		const currentRefreshToken = this.getRefreshToken();
		if (!currentRefreshToken) {
			throw new Error('No refresh token available');
		}

		const url = this.baseUrl + '/api/auth/refresh';

		const response = await fetch(url, {
			method: 'POST',
			headers: {
				...this.headers,
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ refreshToken: currentRefreshToken })
		});

		if (!response.ok) {
			throw new Error(`Token refresh failed: ${response.status} ${response.statusText}`);
		}

		const data: RefreshResponse = await response.json();

		if (!data.accessToken || !this.isValidJWTFormat(data.accessToken)) {
			throw new Error('Invalid access token received from refresh endpoint');
		}

		// Update both tokens
		this.setAccessToken(data.accessToken);
		this.setRefreshToken(data.refreshToken);

		return data.accessToken;
	}

	/**
	 * Authenticate user with email and password
	 * @param email - User email
	 * @param password - User password
	 * @returns Promise resolving to login response
	 */
	public async login(email: string, password: string): Promise<LoginResponse> {
		try {
			const response = await this.request<LoginResponse>('/api/auth/login', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ email, password })
			});

			// Validate and set both tokens
			if (response.accessToken && this.isValidJWTFormat(response.accessToken)) {
				this.setAccessToken(response.accessToken);
				if (response.refreshToken) {
					this.setRefreshToken(response.refreshToken);
				}
			} else {
				throw new Error('Invalid access token received from server');
			}

			return response;
		} catch (error) {
			// Clear any existing token on login failure
			this.clearToken();
			throw error;
		}
	}

	// Core HTTP methods

	/**
	 * Make HTTP request with automatic auth header injection and token refresh
	 * @param path - API endpoint path
	 * @param options - Fetch options
	 * @returns Promise resolving to parsed response
	 */
	public async request<T>(path: string, options: RequestInit = {}): Promise<T> {
		const url = this.baseUrl + path;

		// First attempt with current token
		const authHeaders = this.getAuthHeaders();
		const requestOptions: RequestInit = {
			...options,
			headers: {
				...this.headers,
				...authHeaders,
				...options.headers
			}
		};

		let response = await fetch(url, requestOptions);

		// If 401 and we have a token, try to refresh it
		if (response.status === 401 && this.accessToken && !this.isRefreshing) {
			try {
				// Attempt to refresh the access token
				await this.refreshAccessToken();

				// Retry the original request with new token
				const newAuthHeaders = this.getAuthHeaders();
				const retryOptions: RequestInit = {
					...options,
					headers: {
						...this.headers,
						...newAuthHeaders,
						...options.headers
					}
				};

				response = await fetch(url, retryOptions);
			} catch (refreshError) {
				// Refresh failed, clear tokens and redirect to login
				this.clearToken();

				if (browser) {
					try {
						const { goto } = await import('$app/navigation');
						goto('/user/login');
					} catch (error) {
						console.warn('Failed to redirect to login:', error);
					}
				}

				throw new Error(`Authentication failed and token refresh failed: ${refreshError}`);
			}
		}

		// Handle other auth errors (403, or 401 after refresh attempt)
		if (!response.ok) {
			if ((response.status === 401 || response.status === 403) && this.accessToken) {
				this.clearToken();

				// Redirect to login page if running in browser
				if (browser) {
					try {
						const { goto } = await import('$app/navigation');
						goto('/user/login');
					} catch (error) {
						console.warn('Failed to redirect to login:', error);
					}
				}
			}

			throw new Error(
				`[API Wrapper] The request to ${url} (${options.method || 'GET'}) failed. Status: ${response.status} ${response.statusText}, body: ${await response.text()}`
			);
		}

		return (await response.json()) as T;
	}

	/**
	 * Make GET request
	 * @param path - API endpoint path
	 * @returns Promise resolving to parsed response
	 */
	public get<T>(path: string): Promise<T> {
		return this.request<T>(path, { method: 'GET' });
	}

	/**
	 * Make POST request
	 * @param path - API endpoint path
	 * @param body - Request body object
	 * @returns Promise resolving to parsed response
	 */
	public post<T>(path: string, body: object): Promise<T> {
		return this.request<T>(path, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(body)
		});
	}

	/**
	 * Make PUT request
	 * @param path - API endpoint path
	 * @param body - Request body object
	 * @returns Promise resolving to parsed response
	 */
	public put<T>(path: string, body: object): Promise<T> {
		return this.request<T>(path, {
			method: 'PUT',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(body)
		});
	}

	/**
	 * Make DELETE request
	 * @param path - API endpoint path
	 * @returns Promise resolving to parsed response
	 */
	public delete<T>(path: string): Promise<T> {
		return this.request<T>(path, { method: 'DELETE' });
	}

	// Legacy API endpoints (maintaining backward compatibility)

	static getHistoryUser(): HistoryService[] | PromiseLike<HistoryService[]> {
		throw new Error('Method not implemented.');
	}

	public getAllServices() {
		return this.get<Service[]>('/services');
	}

	public getServiceById(id: number) {
		return this.get<DetailedService>(`/services/${id}`);
	}

	public executeService(id: number, body: RequestService) {
		return this.post<ServiceResponse>(`/services/${id}/execute`, body);
	}

	public getHistoryUser(userId: number) {
		return this.get<HistoryService[]>(`/services/history?userId=${userId}`);
	}

	public getAllHistory() {
		return this.get<HistoryService[]>('/services/history');
	}

	public getDetailedHistory(id: number) {
		return this.get<DetailedHistoryService>(`/services/history/${id}`);
	}
}

// Singleton instance for app-wide usage
export const api = new ApiWrapper();

// Export the class as default for backward compatibility
export default ApiWrapper;
