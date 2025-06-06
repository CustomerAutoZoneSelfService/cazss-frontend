/**
 * @vitest-environment jsdom
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/svelte';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import LoginPage from '../+page.svelte';
import { api } from '$lib/ApiWrapper';
import { addJWTMockToApiWrapper } from '$lib/mockApiWrapper';

// Mock SvelteKit navigation - using a factory function to avoid hoisting issues
vi.mock('$app/navigation', () => ({
	goto: vi.fn()
}));

// Import mocked navigation after the mock is set
import { goto } from '$app/navigation';

describe('Login Page', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		// Explicitly clear the goto mock
		vi.mocked(goto).mockClear();
		// Setup JWT mocks for each test
		addJWTMockToApiWrapper(api);
	});

	describe('Initial Render', () => {
		it('should render the login form with all required elements', async () => {
			render(LoginPage);

			// Check for form elements
			expect(screen.getByPlaceholderText('Correo electrónico')).toBeInTheDocument();
			expect(screen.getByPlaceholderText('Contraseña')).toBeInTheDocument();
			expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();

			// Check for heading and subtitle
			expect(screen.getByText(/welcome to/i)).toBeInTheDocument();
			expect(screen.getByText('CAZSS!')).toBeInTheDocument();
			expect(screen.getByText(/make it simple/i)).toBeInTheDocument();
		});

		it('should have proper input attributes', () => {
			render(LoginPage);

			const emailInput = screen.getByPlaceholderText('Correo electrónico');
			const passwordInput = screen.getByPlaceholderText('Contraseña');

			expect(emailInput).toHaveAttribute('type', 'email');
			expect(passwordInput).toHaveAttribute('type', 'password');
		});

		it('should have login button disabled when fields are empty', () => {
			render(LoginPage);

			const loginButton = screen.getByRole('button', { name: /login/i });
			expect(loginButton).toBeDisabled();
		});
	});

	describe('Form Interaction', () => {
		it('should enable login button when both fields are filled', async () => {
			render(LoginPage);

			const emailInput = screen.getByPlaceholderText('Correo electrónico');
			const passwordInput = screen.getByPlaceholderText('Contraseña');
			const loginButton = screen.getByRole('button', { name: /login/i });

			await fireEvent.input(emailInput, { target: { value: 'user@example.com' } });
			await fireEvent.input(passwordInput, { target: { value: 'password123' } });

			expect(loginButton).not.toBeDisabled();
		});

		it('should show validation error when trying to submit empty form', async () => {
			render(LoginPage);

			const loginButton = screen.getByRole('button', { name: /login/i });

			// Button should be disabled when fields are empty
			expect(loginButton).toBeDisabled();
		});
	});

	describe('Login Error Scenarios', () => {
		it('should show error message for invalid email credentials', async () => {
			render(LoginPage);

			const emailInput = screen.getByPlaceholderText('Correo electrónico');
			const passwordInput = screen.getByPlaceholderText('Contraseña');
			const loginButton = screen.getByRole('button', { name: /login/i });

			// Track initial call count
			const initialCallCount = vi.mocked(goto).mock.calls.length;

			// Fill in invalid email (triggers 401)
			await fireEvent.input(emailInput, { target: { value: 'invalid@example.com' } });
			await fireEvent.input(passwordInput, { target: { value: 'password123' } });

			// Submit the form
			await fireEvent.click(loginButton);

			// Wait for error message to appear
			await waitFor(
				() => {
					expect(screen.getByText('Credenciales inválidas')).toBeInTheDocument();
				},
				{ timeout: 1000 }
			);

			// Verify goto was not called since the initial count (no new calls on error)
			expect(vi.mocked(goto).mock.calls.length).toBe(initialCallCount);
		});

		it('should show error message for wrong password', async () => {
			render(LoginPage);

			const emailInput = screen.getByPlaceholderText('Correo electrónico');
			const passwordInput = screen.getByPlaceholderText('Contraseña');
			const loginButton = screen.getByRole('button', { name: /login/i });

			// Track initial call count
			const initialCallCount = vi.mocked(goto).mock.calls.length;

			// Fill in wrong password (triggers 401)
			await fireEvent.input(emailInput, { target: { value: 'user@example.com' } });
			await fireEvent.input(passwordInput, { target: { value: 'wrongpassword' } });

			// Submit the form
			await fireEvent.click(loginButton);

			// Wait for error message to appear
			await waitFor(
				() => {
					expect(screen.getByText('Credenciales inválidas')).toBeInTheDocument();
				},
				{ timeout: 1000 }
			);

			// Verify goto was not called since the initial count
			expect(vi.mocked(goto).mock.calls.length).toBe(initialCallCount);
		});

		it('should show error message for test fail email', async () => {
			render(LoginPage);

			const emailInput = screen.getByPlaceholderText('Correo electrónico');
			const passwordInput = screen.getByPlaceholderText('Contraseña');
			const loginButton = screen.getByRole('button', { name: /login/i });

			// Track initial call count
			const initialCallCount = vi.mocked(goto).mock.calls.length;

			// Fill in test fail email (triggers 401)
			await fireEvent.input(emailInput, { target: { value: 'test@fail.com' } });
			await fireEvent.input(passwordInput, { target: { value: 'password123' } });

			// Submit the form
			await fireEvent.click(loginButton);

			// Wait for error message to appear
			await waitFor(
				() => {
					expect(screen.getByText('Credenciales inválidas')).toBeInTheDocument();
				},
				{ timeout: 1000 }
			);

			// Verify goto was not called since the initial count
			expect(vi.mocked(goto).mock.calls.length).toBe(initialCallCount);
		});

		it('should show error message for admin with wrong password', async () => {
			render(LoginPage);

			const emailInput = screen.getByPlaceholderText('Correo electrónico');
			const passwordInput = screen.getByPlaceholderText('Contraseña');
			const loginButton = screen.getByRole('button', { name: /login/i });

			// Track initial call count
			const initialCallCount = vi.mocked(goto).mock.calls.length;

			// Fill in admin email with wrong password (triggers 401)
			await fireEvent.input(emailInput, { target: { value: 'admin@test.com' } });
			await fireEvent.input(passwordInput, { target: { value: 'wrongpass' } });

			// Submit the form
			await fireEvent.click(loginButton);

			// Wait for error message to appear
			await waitFor(
				() => {
					expect(screen.getByText('Credenciales inválidas')).toBeInTheDocument();
				},
				{ timeout: 1000 }
			);

			// Verify goto was not called since the initial count
			expect(vi.mocked(goto).mock.calls.length).toBe(initialCallCount);
		});

		it('should clear error message on new login attempt', async () => {
			render(LoginPage);

			const emailInput = screen.getByPlaceholderText('Correo electrónico');
			const passwordInput = screen.getByPlaceholderText('Contraseña');
			const loginButton = screen.getByRole('button', { name: /login/i });

			// First attempt with invalid credentials
			await fireEvent.input(emailInput, { target: { value: 'invalid@example.com' } });
			await fireEvent.input(passwordInput, { target: { value: 'password123' } });
			await fireEvent.click(loginButton);

			// Wait for error to appear
			await waitFor(() => {
				expect(screen.getByText('Credenciales inválidas')).toBeInTheDocument();
			});

			// Second attempt with valid credentials
			await fireEvent.input(emailInput, { target: { value: 'user@example.com' } });
			await fireEvent.input(passwordInput, { target: { value: 'password123' } });
			await fireEvent.click(loginButton);

			// Error message should disappear during new attempt
			await waitFor(() => {
				expect(screen.queryByText('Credenciales inválidas')).not.toBeInTheDocument();
			});
		});
	});

	describe('Login Success Scenarios', () => {
		it('should successfully login with valid credentials and redirect', async () => {
			render(LoginPage);

			const emailInput = screen.getByPlaceholderText('Correo electrónico');
			const passwordInput = screen.getByPlaceholderText('Contraseña');
			const loginButton = screen.getByRole('button', { name: /login/i });

			// Fill in valid credentials
			await fireEvent.input(emailInput, { target: { value: 'user@example.com' } });
			await fireEvent.input(passwordInput, { target: { value: 'password123' } });

			// Submit the form
			await fireEvent.click(loginButton);

			// Wait for the login process to complete
			await waitFor(
				() => {
					expect(goto).toHaveBeenCalledWith('/');
				},
				{ timeout: 1000 }
			);
		});

		it('should show loading state during login process', async () => {
			render(LoginPage);

			const emailInput = screen.getByPlaceholderText('Correo electrónico');
			const passwordInput = screen.getByPlaceholderText('Contraseña');
			const loginButton = screen.getByRole('button', { name: /login/i });

			// Fill in valid credentials
			await fireEvent.input(emailInput, { target: { value: 'test@example.com' } });
			await fireEvent.input(passwordInput, { target: { value: 'validpass' } });

			// Submit the form
			await fireEvent.click(loginButton);

			// Check for loading state
			expect(screen.getByText('Iniciando sesión...')).toBeInTheDocument();
			expect(loginButton).toBeDisabled();
		});

		it('should successfully login admin with correct password', async () => {
			render(LoginPage);

			const emailInput = screen.getByPlaceholderText('Correo electrónico');
			const passwordInput = screen.getByPlaceholderText('Contraseña');
			const loginButton = screen.getByRole('button', { name: /login/i });

			// Fill in admin credentials correctly
			await fireEvent.input(emailInput, { target: { value: 'admin@test.com' } });
			await fireEvent.input(passwordInput, { target: { value: 'admin123' } });

			// Submit the form
			await fireEvent.click(loginButton);

			// Wait for successful redirect
			await waitFor(
				() => {
					expect(goto).toHaveBeenCalledWith('/');
				},
				{ timeout: 1000 }
			);
		});
	});

	describe('UI Styling and Classes', () => {
		it('should have proper CSS classes for styling', () => {
			render(LoginPage);

			// Check for main container classes
			const container = document.querySelector('.login-container');
			expect(container).toBeInTheDocument();

			// Check for input styling classes
			const emailInput = screen.getByPlaceholderText('Correo electrónico');
			expect(emailInput).toHaveClass('login-input');
		});

		it('should display proper title in document head', () => {
			render(LoginPage);

			// Check document title
			expect(document.title).toBe('Login - CAZSS');
		});

		it('should display error message with proper styling', async () => {
			render(LoginPage);

			const emailInput = screen.getByPlaceholderText('Correo electrónico');
			const passwordInput = screen.getByPlaceholderText('Contraseña');
			const loginButton = screen.getByRole('button', { name: /login/i });

			// Trigger an error
			await fireEvent.input(emailInput, { target: { value: 'invalid@example.com' } });
			await fireEvent.input(passwordInput, { target: { value: 'password123' } });
			await fireEvent.click(loginButton);

			// Wait for error and check its styling
			await waitFor(() => {
				const errorDiv = screen.getByText('Credenciales inválidas').closest('div');
				expect(errorDiv).toHaveClass(
					'rounded-lg',
					'border',
					'border-red-200',
					'bg-red-50',
					'text-red-700'
				);
			});
		});
	});

	describe('Form Structure', () => {
		it('should prevent default form submission', async () => {
			render(LoginPage);

			const form = document.querySelector('form');
			const submitEvent = new Event('submit', { bubbles: true, cancelable: true });

			await fireEvent(form!, submitEvent);

			expect(submitEvent.defaultPrevented).toBe(true);
		});

		it('should have proper form structure', () => {
			render(LoginPage);

			const form = document.querySelector('form');
			expect(form).toBeInTheDocument();

			const emailInput = screen.getByPlaceholderText('Correo electrónico');
			const passwordInput = screen.getByPlaceholderText('Contraseña');

			expect(emailInput).toHaveAttribute('name', 'email');
			expect(passwordInput).toHaveAttribute('name', 'password');
		});
	});
});
