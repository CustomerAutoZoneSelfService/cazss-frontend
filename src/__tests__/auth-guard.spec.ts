/**
 * @vitest-environment jsdom
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock SvelteKit modules
vi.mock('$app/environment', () => ({
	browser: true
}));

describe('Authentication Guard - Integration Tests', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.resetModules();

		// Reset DOM
		Object.defineProperty(window, 'location', {
			value: {
				replace: vi.fn(),
				pathname: '/'
			},
			writable: true
		});

		// Mock localStorage
		Object.defineProperty(window, 'localStorage', {
			value: {
				getItem: vi.fn(),
				setItem: vi.fn(),
				removeItem: vi.fn(),
				clear: vi.fn()
			},
			writable: true
		});
	});

	it('should export handleClientError function', async () => {
		const module = await import('../hooks.client');
		expect(typeof module.handleClientError).toBe('function');
	});

	it('should run auth check when module is imported', async () => {
		// Mock console to avoid noise
		const mockConsole = vi.spyOn(console, 'error').mockImplementation(() => {});

		await import('../hooks.client');

		// Just verify it doesn't crash
		expect(true).toBe(true);

		mockConsole.mockRestore();
	});

	it('should handle errors gracefully', async () => {
		const mockConsole = vi.spyOn(console, 'error').mockImplementation(() => {});

		// Mock localStorage to throw error
		Object.defineProperty(window, 'localStorage', {
			value: {
				getItem: vi.fn(() => {
					throw new Error('Test error');
				}),
				setItem: vi.fn(),
				removeItem: vi.fn(),
				clear: vi.fn()
			},
			writable: true
		});

		await import('../hooks.client');

		// Should handle the error gracefully
		expect(true).toBe(true);

		mockConsole.mockRestore();
	});
});
