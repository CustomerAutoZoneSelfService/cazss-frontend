/**
 * @vitest-environment jsdom
 */

import { render, screen, fireEvent, cleanup } from '@testing-library/svelte';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import Sidebar from '../Sidebar.svelte';
import { user, type User } from '$lib/stores/user';

// Mock the Lucide icons to avoid import issues in tests
vi.mock('lucide-svelte', () => ({
	Menu: 'div',
	X: 'div',
	Home: 'div',
	Settings: 'div',
	History: 'div',
	Archive: 'div',
	User: 'div'
}));

describe('Sidebar', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		user.set(null);
	});

	describe('Rendering', () => {
		it('should render navigation links', () => {
			render(Sidebar);

			expect(screen.getByText('Home')).toBeInTheDocument();
			expect(screen.getByText('HistoryAdmin')).toBeInTheDocument();
			expect(screen.getByText('HistoryUser')).toBeInTheDocument();
			expect(screen.getByText('Create')).toBeInTheDocument();
		});

		it('should render UsernameButton', () => {
			const mockUser: User = {
				user_id: '1',
				username: 'john_doe',
				email: 'john@example.com',
				role: 'USER'
			};
			user.set(mockUser);

			render(Sidebar);

			// Should render the username button with user account menu
			const accountButton = screen.getByRole('button', { name: /user account menu/i });
			expect(accountButton).toBeInTheDocument();
		});

		it('should render UsernameButton even when user store is empty', () => {
			// User store is null
			render(Sidebar);

			// Should still render the username button (shows "User" by default)
			const accountButton = screen.getByRole('button', { name: /user account menu/i });
			expect(accountButton).toBeInTheDocument();
			expect(screen.getByText('User')).toBeInTheDocument();
		});

		it('should have proper navigation links with correct hrefs', () => {
			render(Sidebar);

			const homeLink = screen.getByText('Home').closest('a');
			const historyAdminLink = screen.getByText('HistoryAdmin').closest('a');
			const historyUserLink = screen.getByText('HistoryUser').closest('a');
			const createLink = screen.getByText('Create').closest('a');

			expect(homeLink).toHaveAttribute('href', '/');
			expect(historyAdminLink).toHaveAttribute('href', '/history/admin');
			expect(historyUserLink).toHaveAttribute('href', '/history/user?userId=5');
			expect(createLink).toHaveAttribute('href', '/configure');
		});
	});

	describe('Collapse Functionality', () => {
		it('should toggle sidebar collapse state', async () => {
			render(Sidebar);

			const collapseButton = screen.getByRole('button', { name: /expandir o colapsar menú/i });
			expect(collapseButton).toBeInTheDocument();

			// Initially expanded - nav text should be visible
			expect(screen.getByText('Home')).toBeInTheDocument();
			expect(screen.getByText('HistoryAdmin')).toBeInTheDocument();

			// Click to collapse
			await fireEvent.click(collapseButton);

			// After collapse, text should still be in document but possibly hidden via CSS
			// The collapse functionality is handled via CSS classes
			const sidebar = document.querySelector('.sidebar');
			expect(sidebar).toHaveClass('collapsed');
		});

		it('should pass collapsed state to UsernameButton', async () => {
			const mockUser: User = {
				user_id: '1',
				username: 'john_doe',
				email: 'john@example.com',
				role: 'USER'
			};
			user.set(mockUser);

			render(Sidebar);

			const collapseButton = screen.getByRole('button', { name: /expandir o colapsar menú/i });

			// Initially expanded - username should be visible
			expect(screen.getByText('John_doe')).toBeInTheDocument();

			// Click to collapse
			await fireEvent.click(collapseButton);

			// Username should no longer be visible when collapsed
			expect(screen.queryByText('John_doe')).not.toBeInTheDocument();
			// But the button should still be there
			expect(screen.getByRole('button', { name: /user account menu/i })).toBeInTheDocument();
		});

		it('should have proper CSS classes for collapsed and expanded states', async () => {
			render(Sidebar);

			const sidebar = document.querySelector('.sidebar');
			const collapseButton = screen.getByRole('button', { name: /expandir o colapsar menú/i });

			// Initially expanded
			expect(sidebar).toHaveClass('expanded');
			expect(sidebar).not.toHaveClass('collapsed');

			// Click to collapse
			await fireEvent.click(collapseButton);

			// Should be collapsed
			expect(sidebar).toHaveClass('collapsed');
			expect(sidebar).not.toHaveClass('expanded');

			// Click again to expand
			await fireEvent.click(collapseButton);

			// Should be expanded again
			expect(sidebar).toHaveClass('expanded');
			expect(sidebar).not.toHaveClass('collapsed');
		});
	});

	describe('Layout and Styling', () => {
		it('should have proper sidebar styling classes', () => {
			render(Sidebar);

			const sidebar = document.querySelector('.sidebar');
			expect(sidebar).toHaveClass('flex', 'min-h-screen', 'flex-col', 'justify-between');
		});

		it('should have navigation items with proper styling', () => {
			render(Sidebar);

			const navItems = document.querySelectorAll('.nav-item');
			expect(navItems.length).toBeGreaterThan(0);

			navItems.forEach((item) => {
				expect(item).toHaveClass(
					'flex',
					'cursor-pointer',
					'items-center',
					'space-x-3',
					'rounded-lg',
					'p-3'
				);
			});
		});

		it('should position collapse button correctly', () => {
			render(Sidebar);

			// Use a more specific selector to find the collapse button container
			const collapseButtonContainer = document.querySelector('div[class*="fixed"][class*="top-4"]');
			expect(collapseButtonContainer).toBeInTheDocument();
			expect(collapseButtonContainer).toHaveClass('fixed', 'top-4', 'z-50');
		});
	});

	describe('User Integration', () => {
		it('should update username display when user store changes', async () => {
			// Start with empty store
			user.set(null);
			render(Sidebar);

			// Initially shows "User"
			expect(screen.getByText('User')).toBeInTheDocument();
			cleanup();

			// Update user store and re-render
			const mockUser: User = {
				user_id: '1',
				username: 'admin_user',
				email: 'admin@test.com',
				role: 'ADMIN'
			};
			user.set(mockUser);
			render(Sidebar);

			// Should show updated username
			expect(screen.getByText('Admin_user')).toBeInTheDocument();
			expect(screen.queryByText('User')).not.toBeInTheDocument();
		});

		it('should handle user store being cleared', async () => {
			// Start with user data
			const mockUser: User = {
				user_id: '1',
				username: 'test_user',
				email: 'test@example.com',
				role: 'USER'
			};
			user.set(mockUser);

			render(Sidebar);
			expect(screen.getByText('Test_user')).toBeInTheDocument();
			cleanup();

			// Clear user store and re-render
			user.set(null);
			render(Sidebar);

			// Should revert to default
			expect(screen.getByText('User')).toBeInTheDocument();
			expect(screen.queryByText('Test_user')).not.toBeInTheDocument();
		});
	});

	describe('Accessibility', () => {
		it('should have proper ARIA labels', () => {
			render(Sidebar);

			const collapseButton = screen.getByRole('button', { name: /expandir o colapsar menú/i });
			expect(collapseButton).toHaveAttribute('aria-label', 'Expandir o colapsar menú');

			const accountButton = screen.getByRole('button', { name: /user account menu/i });
			expect(accountButton).toHaveAttribute('aria-label', 'User account menu');
		});

		it('should have proper link structure for navigation', () => {
			render(Sidebar);

			const links = screen.getAllByRole('link');
			expect(links).toHaveLength(4); // Home, HistoryAdmin, HistoryUser, Create
		});
	});
});
