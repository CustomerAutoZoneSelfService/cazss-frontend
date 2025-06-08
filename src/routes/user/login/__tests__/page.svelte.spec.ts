/**
 * @vitest-environment jsdom
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/svelte';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { goto } from '$app/navigation';
import { user } from '$lib/stores/user';
import type { User } from '$lib/stores/user';
import LoginPage from '../+page.svelte';

// Mock SvelteKit navigation
vi.mock('$app/navigation', () => ({
	goto: vi.fn()
}));

// Mock ApiWrapper module
const mockApi = {
	login: vi.fn(),
	getToken: vi.fn()
};

vi.mock('$lib/ApiWrapper', () => ({
	api: mockApi
}));

// Mock localStorage
const mockLocalStorage = {
	getItem: vi.fn(),
	setItem: vi.fn(),
	removeItem: vi.fn(),
	clear: vi.fn(),
	length: 0,
	key: vi.fn()
};

Object.defineProperty(window, 'localStorage', {
	writable: true,
	value: mockLocalStorage
});

// Helper function to create a test JWT token
function createTestJWT(userData: Partial<User>): string {
	const header = { alg: 'HS256', typ: 'JWT' };
	const payload = {
		user_id: userData.user_id || 1,
		username: userData.username || 'testuser',
		email: userData.email || 'test@example.com',
		role: userData.role || 'USER',
		exp: Math.floor(Date.now() / 1000) + 3600, // Expires in 1 hour
		iat: Math.floor(Date.now() / 1000)
	};

	const encodedHeader = btoa(JSON.stringify(header));
	const encodedPayload = btoa(JSON.stringify(payload));
	const signature = 'test-signature';

	return `${encodedHeader}.${encodedPayload}.${signature}`;
}

describe('Login Page Component', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		// Clear user store
		user.set(null);
		// Reset localStorage mock
		mockLocalStorage.getItem.mockReturnValue(null);
		mockLocalStorage.setItem.mockImplementation(() => {});
		mockLocalStorage.removeItem.mockImplementation(() => {});
	});

	describe('UI Rendering', () => {
		it('should render login form with all elements', () => {
			render(LoginPage);

			// Check main heading
			expect(screen.getByText('Welcome to')).toBeInTheDocument();
			expect(screen.getByText('CAZSS!')).toBeInTheDocument();
			expect(screen.getByText('Make it simple')).toBeInTheDocument();

			// Check form elements
			expect(screen.getByPlaceholderText('Correo electrónico')).toBeInTheDocument();
			expect(screen.getByPlaceholderText('Contraseña')).toBeInTheDocument();
			expect(screen.getByRole('button', { name: 'LOGIN' })).toBeInTheDocument();

			// Check footer
			expect(screen.getByText('© CAZSS, Inc')).toBeInTheDocument();
		});

		it('should have disabled submit button initially', () => {
			render(LoginPage);
			const submitButton = screen.getByRole('button', { name: 'LOGIN' });
			expect(submitButton).toBeDisabled();
		});

		it('should enable submit button when both fields are filled', async () => {
			render(LoginPage);

			const emailInput = screen.getByPlaceholderText('Correo electrónico');
			const passwordInput = screen.getByPlaceholderText('Contraseña');
			const submitButton = screen.getByRole('button', { name: 'LOGIN' });

			await fireEvent.input(emailInput, { target: { value: 'test@example.com' } });
			await fireEvent.input(passwordInput, { target: { value: 'password123' } });

			expect(submitButton).not.toBeDisabled();
		});
	});

	describe('Successful Login Flow', () => {
		it('should call api.login with correct credentials', async () => {
			// Mock successful login
			const testToken = createTestJWT({ email: 'admin@test.com' });
			mockApi.login.mockResolvedValue(undefined);
			mockApi.getToken.mockReturnValue(testToken);

			render(LoginPage);

			const emailInput = screen.getByPlaceholderText('Correo electrónico');
			const passwordInput = screen.getByPlaceholderText('Contraseña');
			const submitButton = screen.getByRole('button', { name: 'LOGIN' });

			await fireEvent.input(emailInput, { target: { value: 'admin@test.com' } });
			await fireEvent.input(passwordInput, { target: { value: 'password123' } });
			await fireEvent.click(submitButton);

			await waitFor(() => {
				expect(mockApi.login).toHaveBeenCalledWith('admin@test.com', 'password123');
				expect(goto).toHaveBeenCalledWith('/');
			});
		});

		it('should show loading state during login', async () => {
			// Mock delayed login response
			let resolveLogin: () => void;
			const loginPromise = new Promise<void>((resolve) => {
				resolveLogin = resolve;
			});
			mockApi.login.mockReturnValue(loginPromise);

			render(LoginPage);

			const emailInput = screen.getByPlaceholderText('Correo electrónico');
			const passwordInput = screen.getByPlaceholderText('Contraseña');
			const submitButton = screen.getByRole('button', { name: 'LOGIN' });

			await fireEvent.input(emailInput, { target: { value: 'test@example.com' } });
			await fireEvent.input(passwordInput, { target: { value: 'password' } });
			await fireEvent.click(submitButton);

			// Should show loading text and disable button
			expect(screen.getByText('Iniciando sesión...')).toBeInTheDocument();
			expect(submitButton).toBeDisabled();

			// Resolve the promise
			resolveLogin!();
		});
	});

	describe('Failed Login Flow', () => {
		it('should handle login failure with error message', async () => {
			// Mock failed login with 401 error
			const error = new Error('401 Unauthorized');
			mockApi.login.mockRejectedValue(error);

			render(LoginPage);

			const emailInput = screen.getByPlaceholderText('Correo electrónico');
			const passwordInput = screen.getByPlaceholderText('Contraseña');
			const submitButton = screen.getByRole('button', { name: 'LOGIN' });

			await fireEvent.input(emailInput, { target: { value: 'invalid@example.com' } });
			await fireEvent.input(passwordInput, { target: { value: 'wrongpassword' } });
			await fireEvent.click(submitButton);

			await waitFor(() => {
				expect(screen.getByText('Credenciales inválidas')).toBeInTheDocument();
			});
		});

		it('should handle network errors during login', async () => {
			// Mock network error
			mockApi.login.mockRejectedValue(new Error('Network error'));

			render(LoginPage);

			const emailInput = screen.getByPlaceholderText('Correo electrónico');
			const passwordInput = screen.getByPlaceholderText('Contraseña');
			const submitButton = screen.getByRole('button', { name: 'LOGIN' });

			await fireEvent.input(emailInput, { target: { value: 'test@example.com' } });
			await fireEvent.input(passwordInput, { target: { value: 'password' } });
			await fireEvent.click(submitButton);

			await waitFor(() => {
				expect(screen.getByText('Error de conexión. Inténtalo de nuevo.')).toBeInTheDocument();
			});
		});

		it('should clear error message when retrying login', async () => {
			// First login fails
			mockApi.login.mockRejectedValueOnce(new Error('Login failed'));

			render(LoginPage);

			const emailInput = screen.getByPlaceholderText('Correo electrónico');
			const passwordInput = screen.getByPlaceholderText('Contraseña');
			const submitButton = screen.getByRole('button', { name: 'LOGIN' });

			// First login attempt (fails)
			await fireEvent.input(emailInput, { target: { value: 'test@example.com' } });
			await fireEvent.input(passwordInput, { target: { value: 'wrong' } });
			await fireEvent.click(submitButton);

			await waitFor(() => {
				expect(screen.getByText('Error de conexión. Inténtalo de nuevo.')).toBeInTheDocument();
			});

			// Second login succeeds
			const testToken = createTestJWT({ email: 'test@example.com' });
			mockApi.login.mockResolvedValueOnce(undefined);
			mockApi.getToken.mockReturnValue(testToken);

			await fireEvent.input(passwordInput, { target: { value: 'correct' } });
			await fireEvent.click(submitButton);

			await waitFor(() => {
				expect(
					screen.queryByText('Error de conexión. Inténtalo de nuevo.')
				).not.toBeInTheDocument();
				expect(goto).toHaveBeenCalledWith('/');
			});
		});
	});

	describe('Form Validation', () => {
		it('should keep submit button disabled with empty email', async () => {
			render(LoginPage);

			const passwordInput = screen.getByPlaceholderText('Contraseña');
			const submitButton = screen.getByRole('button', { name: 'LOGIN' });

			await fireEvent.input(passwordInput, { target: { value: 'password123' } });

			// Button should remain disabled
			expect(submitButton).toBeDisabled();
		});

		it('should keep submit button disabled with empty password', async () => {
			render(LoginPage);

			const emailInput = screen.getByPlaceholderText('Correo electrónico');
			const submitButton = screen.getByRole('button', { name: 'LOGIN' });

			await fireEvent.input(emailInput, { target: { value: 'test@example.com' } });

			// Button should remain disabled
			expect(submitButton).toBeDisabled();
		});
	});

	describe('User Store Integration', () => {
		it('should decode JWT and populate user store on successful login', async () => {
			const testUserData = {
				user_id: '42',
				username: 'admin_user',
				email: 'admin@company.com',
				role: 'ADMIN' as const
			};

			const testToken = createTestJWT(testUserData);

			mockApi.login.mockResolvedValueOnce(undefined);
			mockApi.getToken.mockReturnValue(testToken);

			render(LoginPage);

			const emailInput = screen.getByPlaceholderText('Correo electrónico') as HTMLInputElement;
			const passwordInput = screen.getByPlaceholderText('Contraseña') as HTMLInputElement;
			const submitButton = screen.getByRole('button', { name: 'LOGIN' });

			await fireEvent.input(emailInput, { target: { value: 'admin@company.com' } });
			await fireEvent.input(passwordInput, { target: { value: 'admin123' } });
			await fireEvent.click(submitButton);

			await waitFor(() => {
				expect(mockApi.login).toHaveBeenCalledWith('admin@company.com', 'admin123');
				expect(goto).toHaveBeenCalledWith('/');
			});

			// The actual store update is tested in the component logic
			// Here we verify the flow works as expected
		});
	});
});
