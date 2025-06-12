import ApiWrapper from '$lib/ApiWrapper';
import type { Service, DetailedService, CategoryWithServices } from './types/ApiWrapper';
import type { ServiceResponse } from './types/ServiceResponse';
import type { RequestUserFilterDTO, UserFilterDTO } from './types/Filter';

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
	addJWTMockToApiWrapper(mockApi)
	mockApi.getAllServices = async function (): Promise<CategoryWithServices[]> {
		return [
			{
				categoryId: 797,
				name: "chango",
				color: "#425af5",
				endpoints: [
					{
						endpointId: 52,
						name: "Test Service Uno Hola",
						description: "AAAAAA"
					},
					{
						endpointId: 66,
						name: "Test Service Dos",
						description: "AAAAAA"
					}
				]
			},
			{
				categoryId: 888,
				name: "chango DOS",
				color: "#425af5",
				endpoints: [
					{
						endpointId: 52,
						name: "Hola",
						description: "AAAAAA"
					},
					{
						endpointId: 66,
						name: "Test Uno Dos",
						description: "AAAAAA"
					}
				]
			}
		];
	};

	mockApi.getServiceById = async function (id: number): Promise<DetailedService> {
		if (id.toString() !== '5') {
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
				filters: [
					{
						responsePatternId: 1,
						pattern: 'PRODUCT_NAME',
						name: 'productName',
						description: 'Name of the product.'
					},
					{
						responsePatternId: 2,
						pattern: 'PRICE',
						name: 'price',
						description: 'Price of the product.'
					}
				],
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
		} else {
			return {
				id: 5,
				name: 'Pdf Demo',
				description: 'This endpoint tests the pdf functionality',
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
				variables: [],
				requestBody: 'Template'
			};
		}
	};

	mockApi.executeService = async function (id: number): Promise<ServiceResponse> {
		if (id.toString() !== '5') {
			return {
				status: {
					code: 200,
					description: 'Success'
				},
				response: {
					'1': ['John'],
					'2': ['Doe'],
					'3': ['30'],
					'4': ['Laptop'],
					'5': ['1200'],
					'6': ['Intel Core i7', '16GB RAM', '512GB SSD'],
					'7': ['Chihuahua'],
					'8': ['Mexico']
				}
			};
		} else {
			let textContent = '';
			const res = await fetch('/test_pdf.txt');
			textContent = await res.text();

			return {
				status: {
					code: 200,
					description: 'Success'
				},
				response: {
					'-1': [textContent]
				}
			};
		}
	};

	const savedFiltersMap: Map<number, number[]> = new Map();

	mockApi.getUserFilters = async function (endpointId: number): Promise<UserFilterDTO[]> {
		const saved = savedFiltersMap.get(endpointId) ?? [];
		return saved.map((responsePatternId) => ({ responsePatternId }));
	};

	mockApi.createUserFilters = async function (
		endpointId: number,
		body: RequestUserFilterDTO
	): Promise<UserFilterDTO[]> {
		// Guardamos los filtros seleccionados
		savedFiltersMap.set(endpointId, body);
		return body.map((responsePatternId) => ({ responsePatternId }));
	};
	mockApi.getDetailedHistory = async function (
		id: number
	): Promise<import('./types/ApiWrapper').DetailedHistoryService> {
		return {
			historyId: id,
			statusCode: 200,
			endpoint: {
				endpointId: 1,
				name: 'Get PNA by SKU',
				description: 'This endpoint retrieves the PNA by SKU.'
			},
			historyData: {
				request: {
					'CLIENT ID': '1235',
					SKU: '00000',
					method: 'GET',
					url: 'https:blabla'
				},
				response: {
					code: 200,
					description: 'Success',
					firstName: 'John',
					lastName: 'Doe',
					age: '30',
					productName: 'Laptop',
					price: '1200',
					features: ['Intel Core i7', '16GB RAM', '512GB SSD'],
					city: 'Chihuahua',
					country: 'Mexico'
				}
			}
		};
	};
}
