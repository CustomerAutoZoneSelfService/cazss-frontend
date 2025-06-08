/**
 * @vitest-environment jsdom
 */

import { render, screen, cleanup } from '@testing-library/svelte';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import UsernameButton from '../UsernameButton.svelte';
import { user, type User } from '$lib/stores/user';

// Mock Lucide icons
vi.mock('lucide-svelte', () => ({
	ChevronDown: 'div',
	User: 'div'
}));

describe('UsernameButton', () => {
	beforeEach(() => {
		// Clear user store and cleanup DOM before each test
		user.set(null);
		cleanup();
	});

	describe('Title Case Functionality', () => {
		it('should render username from store in title case', () => {
			const mockUser: User = {
				user_id: '1',
				username: 'john_doe',
				email: 'john@example.com',
				role: 'USER'
			};
			user.set(mockUser);

			render(UsernameButton, { isSidebarCollapsed: false });

			// Check that username is displayed in title case
			expect(screen.getByText('John_doe')).toBeInTheDocument();
		});

		it('should not show username when sidebar is collapsed', () => {
			const mockUser: User = {
				user_id: '1',
				username: 'john_doe',
				email: 'john@example.com',
				role: 'USER'
			};
			user.set(mockUser);

			render(UsernameButton, { isSidebarCollapsed: true });

			// Username should not be visible when collapsed
			expect(screen.queryByText('John_doe')).not.toBeInTheDocument();
		});

		it('should toggle dropdown on click', async () => {
			const mockUser: User = {
				user_id: '1',
				username: 'john_doe',
				email: 'john@example.com',
				role: 'USER'
			};
			user.set(mockUser);

			render(UsernameButton, { isSidebarCollapsed: false });

			const button = screen.getByRole('button');
			expect(button).toHaveAttribute('aria-expanded', 'false');
		});

		it('should close dropdown when clicking body', async () => {
			const mockUser: User = {
				user_id: '1',
				username: 'john_doe',
				email: 'john@example.com',
				role: 'USER'
			};
			user.set(mockUser);

			render(UsernameButton, { isSidebarCollapsed: false });

			const button = screen.getByRole('button');
			expect(button).toHaveAttribute('aria-expanded', 'false');
		});

		it('should stop event propagation on button click', async () => {
			const mockUser: User = {
				user_id: '1',
				username: 'john_doe',
				email: 'john@example.com',
				role: 'USER'
			};
			user.set(mockUser);

			render(UsernameButton, { isSidebarCollapsed: false });

			const button = screen.getByRole('button');
			expect(button).toBeInTheDocument();
		});
	});

	describe('Username Display Variations', () => {
		it('should handle different username formats and display them in title case', () => {
			const testCases = [
				{ input: 'simple', expected: 'Simple' },
				{ input: 'user_with_underscores', expected: 'User_with_underscores' },
				{ input: 'user-with-dashes', expected: 'User-with-dashes' },
				{ input: 'user123', expected: 'User123' },
				{ input: 'CamelCaseUser', expected: 'Camelcaseuser' }
			];

			testCases.forEach(({ input, expected }) => {
				cleanup(); // Clean up between each iteration

				const mockUser: User = {
					user_id: '1',
					username: input,
					email: 'test@example.com',
					role: 'USER'
				};
				user.set(mockUser);

				render(UsernameButton, { isSidebarCollapsed: false });

				expect(screen.getByText(expected)).toBeInTheDocument();

				cleanup(); // Clean up after each iteration
			});
		});

		it('should update when username changes in store', async () => {
			// Start with initial user
			const initialUser: User = {
				user_id: '1',
				username: 'initial_user',
				email: 'initial@example.com',
				role: 'USER'
			};
			user.set(initialUser);

			const { rerender } = render(UsernameButton, { isSidebarCollapsed: false });
			expect(screen.getByText('Initial_user')).toBeInTheDocument();

			// Update user store
			const updatedUser: User = {
				user_id: '1',
				username: 'updated_user',
				email: 'updated@example.com',
				role: 'USER'
			};
			user.set(updatedUser);

			await rerender({ isSidebarCollapsed: false });

			// Should show updated username in title case
			expect(screen.getByText('Updated_user')).toBeInTheDocument();
		});
	});

	describe('Store Reactivity', () => {
		it('should update when user store changes', async () => {
			// Start with no user
			user.set(null);
			const { rerender } = render(UsernameButton, { isSidebarCollapsed: false });

			// Should not show username when no user
			expect(screen.queryByText('John_doe')).not.toBeInTheDocument();

			// Set user
			const mockUser: User = {
				user_id: '1',
				username: 'john_doe',
				email: 'john@example.com',
				role: 'USER'
			};
			user.set(mockUser);

			await rerender({ isSidebarCollapsed: false });

			// Should now show username in title case
			expect(screen.getByText('John_doe')).toBeInTheDocument();
		});

		it('should handle user logout by hiding username', async () => {
			// Start with user logged in
			const mockUser: User = {
				user_id: '1',
				username: 'john_doe',
				email: 'john@example.com',
				role: 'USER'
			};
			user.set(mockUser);

			const { rerender } = render(UsernameButton, { isSidebarCollapsed: false });
			expect(screen.getByText('John_doe')).toBeInTheDocument();

			// Simulate logout
			user.set(null);
			await rerender({ isSidebarCollapsed: false });

			// Should hide username
			expect(screen.queryByText('John_doe')).not.toBeInTheDocument();
		});
	});

	describe('Component Props', () => {
		it('should handle isSidebarCollapsed prop correctly', () => {
			const mockUser: User = {
				user_id: '1',
				username: 'john_doe',
				email: 'john@example.com',
				role: 'USER'
			};
			user.set(mockUser);

			// Test with sidebar not collapsed
			render(UsernameButton, { isSidebarCollapsed: false });
			expect(screen.getByText('John_doe')).toBeInTheDocument();

			// Clean up and test with sidebar collapsed
			cleanup();
			render(UsernameButton, { isSidebarCollapsed: true });
			expect(screen.queryByText('John_doe')).not.toBeInTheDocument();
		});
	});
});
