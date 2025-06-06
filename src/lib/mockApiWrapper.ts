import ApiWrapper from '$lib/ApiWrapper';
import type { Service, DetailedService } from './types/ApiWrapper';
import type { HistoryService } from './types/ApiWrapper';
import type { ServiceResponse } from './types/ServiceResponse';
import { browser } from '$app/environment';

/**
 * JWT Login mock functionality with accessToken + refreshToken support
 * Simulates authentication with predefined valid/invalid credentials
 */
export function addJWTMockToApiWrapper(mockApi: ApiWrapper): void {
	// Override login method with mock behavior
	mockApi.login = async function (email: string, password: string) {
		// Simulate API delay
		await new Promise((resolve) => setTimeout(resolve, 300));

		// Simulate 401 for specific invalid credentials
		if (
			email === 'invalid@example.com' ||
			password === 'wrongpassword' ||
			email === 'test@fail.com' ||
			(email === 'admin@test.com' && password !== 'admin123') ||
			(email === 'a01562951@tec.mx' && password !== 'alpargatas33') ||
			(email === 'a01563117@tec.mx' && password !== 'alpargatas33') ||
			email === '' ||
			password === ''
		) {
			throw new Error(
				'[API Wrapper] The request to /auth/login (POST) failed. Status: 401 Unauthorized, body: {"message":"Invalid credentials"}'
			);
		}

		// Map emails to user data for realistic mock scenarios
		const userDataMap: Record<
			string,
			{ user_id: string; username: string; role: 'ADMIN' | 'CONFIG' | 'AUDITOR' | 'USER' }
		> = {
			'admin@test.com': { user_id: '1', username: 'John Doe', role: 'ADMIN' },
			'user@example.com': { user_id: '2', username: 'Jane Smith', role: 'USER' },
			'test@example.com': { user_id: '3', username: 'Michael Johnson', role: 'USER' },
			'config@example.com': { user_id: '4', username: 'Sarah Wilson', role: 'CONFIG' },
			'auditor@example.com': { user_id: '5', username: 'Robert Brown', role: 'AUDITOR' },
			'pedro@test.com': { user_id: '6', username: 'Alberto Pedro Gonzales', role: 'USER' },
			'maria@company.com': { user_id: '7', username: 'María Elena Rodríguez', role: 'USER' },
			'carlos@example.com': { user_id: '8', username: 'Carlos Antonio López', role: 'CONFIG' },
			'ana@test.com': { user_id: '9', username: 'Ana Sofía Martínez', role: 'AUDITOR' },
			// Real backend credentials for testing
			'a01562951@tec.mx': { user_id: '10', username: 'Pedro Estudiante', role: 'USER' },
			'a01563117@tec.mx': { user_id: '11', username: 'Ana Estudiante', role: 'ADMIN' }
		};

		// Generate realistic usernames for unknown emails
		const generateRealisticUsername = (email: string): string => {
			const randomFirstNames = [
				'Alexander',
				'Isabella',
				'Benjamin',
				'Sophia',
				'Christopher',
				'Emma',
				'Daniel',
				'Olivia',
				'Matthew',
				'Ava',
				'Nicholas',
				'Charlotte',
				'Gabriel',
				'Amelia',
				'Samuel',
				'Harper',
				'David',
				'Evelyn'
			];
			const randomLastNames = [
				'García',
				'Rodríguez',
				'González',
				'Fernández',
				'López',
				'Martínez',
				'Sánchez',
				'Pérez',
				'Gómez',
				'Martín',
				'Jiménez',
				'Ruiz',
				'Hernández',
				'Díaz',
				'Moreno',
				'Muñoz',
				'Álvarez',
				'Romero'
			];

			// Use email as seed for consistent usernames per email
			const emailHash = email.split('').reduce((hash, char) => {
				return ((hash << 5) - hash + char.charCodeAt(0)) & 0xffffffff;
			}, 0);

			const firstNameIndex = Math.abs(emailHash) % randomFirstNames.length;
			const lastNameIndex = Math.abs(emailHash >> 8) % randomLastNames.length;

			return `${randomFirstNames[firstNameIndex]} ${randomLastNames[lastNameIndex]}`;
		};

		// Get user data or create default for unknown emails
		const userData = userDataMap[email] || {
			user_id: String(
				1000 +
					(Math.abs(
						email
							.split('')
							.reduce((hash, char) => ((hash << 5) - hash + char.charCodeAt(0)) & 0xffffffff, 0)
					) %
						9999)
			),
			username: generateRealisticUsername(email),
			role: 'USER' as const
		};

		// Create access token (short-lived - 10 minutes)
		const accessTokenHeader = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
		const accessTokenPayload = btoa(
			JSON.stringify({
				sub: userData.user_id, // Use 'sub' instead of 'user_id'
				username: userData.username,
				email,
				role: userData.role, // Backend now sends roles without ROLE_ prefix
				exp: Math.floor(Date.now() / 1000) + 600, // 10 minutes from now
				iat: Math.floor(Date.now() / 1000)
			})
		);
		const accessTokenSignature = btoa('access-token-signature');
		const accessToken = `${accessTokenHeader}.${accessTokenPayload}.${accessTokenSignature}`;

		// Create refresh token (long-lived - 24 hours)
		const refreshTokenHeader = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
		const refreshTokenPayload = btoa(
			JSON.stringify({
				sub: userData.user_id, // Use 'sub' instead of 'user_id'
				username: userData.username,
				exp: Math.floor(Date.now() / 1000) + 86400, // 24 hours from now
				iat: Math.floor(Date.now() / 1000)
			})
		);
		const refreshTokenSignature = btoa('refresh-token-signature');
		const refreshToken = `${refreshTokenHeader}.${refreshTokenPayload}.${refreshTokenSignature}`;

		const response = {
			message: 'Login successful!',
			accessToken: accessToken,
			refreshToken: refreshToken
		};

		// Set both tokens using proper methods
		this.setToken(response.accessToken);
		// Store refresh token in localStorage as well for mock
		try {
			localStorage.setItem('cazss_refresh_token', response.refreshToken);
		} catch {
			console.warn('Failed to save refresh token to localStorage');
		}
		return response;
	};

	// Mock refresh endpoint
	mockApi.request = async function <T>(path: string, options: RequestInit = {}): Promise<T> {
		if (path === '/api/auth/refresh' && options.method === 'POST') {
			try {
				const body = options.body ? JSON.parse(options.body as string) : {};
				const { refreshToken } = body;

				if (!refreshToken) {
					throw new Error('No refresh token provided');
				}

				// Validate refresh token format (basic check)
				if (!refreshToken.includes('.')) {
					throw new Error('Invalid refresh token format');
				}

				// Generate new tokens
				const newAccessTokenHeader = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
				const newAccessTokenPayload = btoa(
					JSON.stringify({
						sub: '1001',
						username: 'Refreshed User',
						email: 'refreshed@example.com',
						role: 'USER',
						exp: Math.floor(Date.now() / 1000) + 600, // 10 minutes from now
						iat: Math.floor(Date.now() / 1000)
					})
				);
				const newAccessTokenSignature = btoa('new-access-token-signature');
				const newAccessToken = `${newAccessTokenHeader}.${newAccessTokenPayload}.${newAccessTokenSignature}`;

				const newRefreshTokenHeader = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
				const newRefreshTokenPayload = btoa(
					JSON.stringify({
						sub: '1001',
						username: 'Refreshed User',
						exp: Math.floor(Date.now() / 1000) + 86400, // 24 hours from now
						iat: Math.floor(Date.now() / 1000)
					})
				);
				const newRefreshTokenSignature = btoa('new-refresh-token-signature');
				const newRefreshToken = `${newRefreshTokenHeader}.${newRefreshTokenPayload}.${newRefreshTokenSignature}`;

				const refreshResponse = {
					message: 'Token refreshed successfully!',
					accessToken: newAccessToken,
					refreshToken: newRefreshToken
				};

				// Update both tokens
				this.setToken(refreshResponse.accessToken);
				try {
					localStorage.setItem('cazss_refresh_token', refreshResponse.refreshToken);
				} catch {
					console.warn('Failed to save refresh token to localStorage');
				}

				return refreshResponse as T;
			} catch {
				throw new Error('401 Unauthorized - Invalid refresh token');
			}
		}

		// Fall back to original request method for other paths
		return ApiWrapper.prototype.request.call(this, path, options) as Promise<T>;
	};
}

export function replaceWithMock(mockApi: ApiWrapper): void {
	mockApi.getAllServices = async function (): Promise<Service[]> {
		return [
			{ endpointId: 1, name: 'getById', description: 'Example description' },
			{ endpointId: 2, name: 'getByName', description: 'Example description 2' },
			{ endpointId: 3, name: 'clearCache', description: 'Example description 3' },
			{ endpointId: 4, name: 'resetSomething', description: 'Example description 4' }
		];
	};

	mockApi.getServiceById = async function (): Promise<DetailedService> {
		return {
			id: 1,
			name: 'Get PNA by SKU',
			description: 'This endpoint retrieves the PNA by SKU.',
			active: true,
			method: 'GET',
			url: 'https:blabla',
			responses: [
				{
					status: 20,
					description: 'OK'
				}
			],
			filters: [],
			variables: [
				{
					requestVariableId: 1,
					type: 'HEADER',
					keyName: 'CLIENT ID',
					defaultValue: '',
					customizable: true,
					description: 'The id of the client'
				},
				{
					requestVariableId: 2,
					type: 'BODY',
					keyName: 'SKU',
					defaultValue: '00000',
					customizable: true,
					description: 'The SKU of the product'
				}
			],
			requestBody: 'Template'
		};
	};

	mockApi.executeService = async function (): Promise<ServiceResponse> {
		return {
			status: {
				code: 200,
				description: 'Success'
			},
			response: [
				{
					firstName: ['John'],
					lastName: ['Doe'],
					age: ['30']
				},
				{
					productName: ['Laptop'],
					price: ['1200'],
					features: ['Intel Core i7', '16GB RAM', '512GB SSD']
				},
				{
					city: ['Chihuahua'],
					country: ['Mexico']
				}
			]
		};
	};

	mockApi.getAllHistory = async function (): Promise<HistoryService[]> {
		return Array.from({ length: 12 }, (_, i) => {
			const dayOffset = Math.floor(i / 3);
			const date = new Date();
			date.setDate(date.getDate() - dayOffset);

			date.setSeconds(date.getSeconds() + (i % 3) * 10);

			return {
				historyId: i + 2,
				email: `user${i + 1}@example.com`,
				endpointName: 'Get TEST',
				endpointDescription:
					'Descripción de un endpoint para obtener un recurso y así poder ver el resultado',
				createdAt: date.toISOString()
			};
		});
	};

	mockApi.getHistoryUser = async function (userId: number): Promise<HistoryService[]> {
		return Array.from({ length: 5 }, (_, i) => {
			const date = new Date();
			date.setDate(date.getDate() - i);
			return {
				historyId: i + 100,
				email: `user${userId}@example.com`,
				endpointName: 'Get TEST',
				endpointDescription: 'Historial filtrado por usuario',
				createdAt: date.toISOString()
			};
		});
	};

	mockApi.getDetailedHistory = async function (
		id: number
	): Promise<import('./types/ApiWrapper').DetailedHistoryService> {
		return {
			historyId: id,
			statusCode: 200,
			endpoint: {
				endpointId: 1,
				name: 'getById',
				description: 'Endpoint de ejemplo para detalles de historial'
			},
			historyData: {
				request: { param1: 'valor1', param2: 'valor2' },
				response: { result: 'ok', data: { foo: 'bar' } }
			}
		};
	};
}

// Auto-initialize mocks in development mode (only if VITE_USE_MOCK is true)
// Check window.ENV first (for E2E tests), then fall back to import.meta.env
function shouldUseMock(): boolean {
	// @ts-expect-error - window.ENV is set by E2E tests for dynamic configuration
	if (typeof window !== 'undefined' && window.ENV) {
		// @ts-expect-error - window.ENV.VITE_USE_MOCK is dynamically set by E2E test configuration
		return window.ENV.VITE_USE_MOCK !== 'false';
	}
	return import.meta.env.VITE_USE_MOCK !== 'false';
}

function getApiUrl(): string {
	// @ts-expect-error - window.ENV is set by E2E tests for dynamic configuration
	if (typeof window !== 'undefined' && window.ENV) {
		// @ts-expect-error - window.ENV.VITE_API_URL is dynamically set by E2E test configuration
		return window.ENV.VITE_API_URL || import.meta.env.VITE_API_URL;
	}
	return import.meta.env.VITE_API_URL;
}

if (browser && import.meta.env.MODE === 'development' && shouldUseMock()) {
	// Import and setup mocks automatically
	import('./ApiWrapper').then(({ api }) => {
		addJWTMockToApiWrapper(api);
		replaceWithMock(api);
		console.log('🔧 Development mocks enabled for ApiWrapper');
	});
} else if (browser && !shouldUseMock()) {
	console.log('🌐 Using REAL backend:', getApiUrl());
}
