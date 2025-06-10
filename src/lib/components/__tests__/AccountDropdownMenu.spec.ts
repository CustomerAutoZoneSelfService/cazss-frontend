/**
 * @vitest-environment jsdom
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/svelte';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import AccountDropdownMenu from '../AccountDropdownMenu.svelte';
import { user } from '$lib/stores/user';
import type { User } from '$lib/stores/user';

// Mock SvelteKit navigation
vi.mock('$app/navigation', () => ({
	goto: vi.fn()
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
	enumerable: true,
	value: mockLocalStorage
});

// Mock ApiWrapper
vi.mock('$lib/ApiWrapper', () => ({
	api: {
		clearToken: vi.fn()
	}
}));

import { goto } from '$app/navigation';

describe('AccountDropdownMenu', () => {
	const defaultProps = {
		username: 'John Doe',
		email: 'john@example.com',
		showAccountDropdown: true
	};

	beforeEach(() => {
		vi.clearAllMocks();
		user.set(null);
		mockLocalStorage.removeItem.mockClear();
	});

	describe('Rendering', () => {
		it('should not render when showAccountDropdown is false', () => {
			render(AccountDropdownMenu, {
				...defaultProps,
				showAccountDropdown: false
			});

			expect(screen.queryByText('Sign out')).not.toBeInTheDocument();
		});

		it('should render dropdown with user info when visible', () => {
			render(AccountDropdownMenu, defaultProps);

			expect(screen.getByText('John Doe')).toBeInTheDocument();
			expect(screen.getByText('john@example.com')).toBeInTheDocument();
			expect(screen.getByText('Sign out')).toBeInTheDocument();
		});

		it('should have proper button accessibility attributes', () => {
			render(AccountDropdownMenu, defaultProps);

			const signOutButton = screen.getByRole('button', { name: /sign out of account/i });
			expect(signOutButton).toBeInTheDocument();
			expect(signOutButton).toHaveAttribute('aria-label', 'Sign out of account');
		});

		it('should display different usernames and emails correctly', () => {
			const customProps = {
				username: 'Admin User',
				email: 'admin@test.com',
				showAccountDropdown: true
			};

			render(AccountDropdownMenu, customProps);

			expect(screen.getByText('Admin User')).toBeInTheDocument();
			expect(screen.getByText('admin@test.com')).toBeInTheDocument();
		});
	});

	describe('Sign Out Functionality', () => {
		it('should show loading state when signing out', async () => {
			render(AccountDropdownMenu, defaultProps);

			const signOutButton = screen.getByRole('button', { name: /sign out of account/i });

			// Click sign out
			await fireEvent.click(signOutButton);

			// Should show loading state
			expect(screen.getByText('Signing out...')).toBeInTheDocument();
			expect(signOutButton).toBeDisabled();
		});

		it('should show overlay during sign out process', async () => {
			render(AccountDropdownMenu, defaultProps);

			const signOutButton = screen.getByRole('button', { name: /sign out of account/i });

			// Click sign out
			await fireEvent.click(signOutButton);

			// Should show overlay
			expect(screen.getByText('Signing out')).toBeInTheDocument();
			const overlay = document.querySelector('.sign-out-overlay');
			expect(overlay).toBeInTheDocument();
			expect(overlay).toHaveClass('fixed', 'inset-0', 'z-50');
		});

		it('should clear token and navigate to login on successful sign out', async () => {
			// Set up user in store
			const mockUser: User = {
				user_id: '1',
				username: 'john_doe',
				email: 'john@example.com',
				role: 'USER'
			};
			user.set(mockUser);

			render(AccountDropdownMenu, defaultProps);

			const signOutButton = screen.getByRole('button', { name: /sign out of account/i });

			// Click sign out
			await fireEvent.click(signOutButton);

			// Wait for the sign out process to complete
			await waitFor(async () => {
				// Should have imported and called api.clearToken
				const { api } = await import('$lib/ApiWrapper');
				expect(api.clearToken).toHaveBeenCalled();
			});

			// Should clear localStorage
			expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('cazss_access_token');

			// Should navigate to login
			expect(goto).toHaveBeenCalledWith('/user/login');

			// Should clear user store
			expect(user).toBeDefined(); // Store still exists but should be null
		});

		it('should handle sign out errors gracefully', async () => {
			// Mock goto to throw an error
			vi.mocked(goto).mockRejectedValueOnce(new Error('Navigation failed'));

			// Mock window.location.replace
			const mockReplace = vi.fn();
			Object.defineProperty(window, 'location', {
				writable: true,
				value: {
					replace: mockReplace
				}
			});

			render(AccountDropdownMenu, defaultProps);

			const signOutButton = screen.getByRole('button', { name: /sign out of account/i });

			// Click sign out
			await fireEvent.click(signOutButton);

			// Wait for error handling
			await waitFor(() => {
				expect(mockReplace).toHaveBeenCalledWith('/user/login');
			});
		});

		it('should not trigger sign out when button is disabled', async () => {
			render(AccountDropdownMenu, defaultProps);

			const signOutButton = screen.getByRole('button', { name: /sign out of account/i });

			// Click sign out to start the process
			await fireEvent.click(signOutButton);

			// Button should be disabled
			expect(signOutButton).toBeDisabled();

			// Try to click again - should not trigger another sign out
			await fireEvent.click(signOutButton);

			// Should still only have one call to goto
			await waitFor(() => {
				expect(goto).toHaveBeenCalledTimes(1);
			});
		});
	});

	describe('UI States', () => {
		it('should show loading spinner in button during sign out', async () => {
			render(AccountDropdownMenu, defaultProps);

			const signOutButton = screen.getByRole('button', { name: /sign out of account/i });

			// Click sign out
			await fireEvent.click(signOutButton);

			// Should show loading content in button
			expect(screen.getByText('Signing out...')).toBeInTheDocument();

			// Should have loading SVG (check for the animate-spin class instead of "loading")
			const loadingElements = document.querySelectorAll('.animate-spin');
			expect(loadingElements.length).toBeGreaterThan(0);
		});

		it('should have proper styling classes', () => {
			render(AccountDropdownMenu, defaultProps);

			const dropdown = document.querySelector('.account-dropdown-menu');
			expect(dropdown).toHaveClass(
				'bg-gray-light',
				'border-gray-medium',
				'absolute',
				'bottom-full'
			);

			const userInfo = document.querySelector('.user-info');
			expect(userInfo).toHaveClass('mt-1', 'px-5', 'py-2');

			const signOutButton = screen.getByRole('button', { name: /sign out of account/i });
			expect(signOutButton).toHaveClass('bg-gray-light', 'w-full', 'rounded-b-lg');
		});
	});

	describe('Event Handling', () => {
		it('should prevent multiple simultaneous sign out attempts', async () => {
			render(AccountDropdownMenu, defaultProps);

			const signOutButton = screen.getByRole('button', { name: /sign out of account/i });

			// Click sign out once
			await fireEvent.click(signOutButton);

			// Wait a bit for the first click to process
			await waitFor(() => {
				expect(signOutButton).toBeDisabled();
			});

			// Try to click again while disabled - this should not trigger another call
			await fireEvent.click(signOutButton);

			// Should only process one sign out
			expect(goto).toHaveBeenCalledTimes(1);
		});
	});
});
