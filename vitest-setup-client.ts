import '@testing-library/jest-dom/vitest';
import { vi } from 'vitest';

// required for svelte5 + jsdom as jsdom does not support matchMedia
Object.defineProperty(window, 'matchMedia', {
	writable: true,
	enumerable: true,
	value: vi.fn().mockImplementation((query) => ({
		matches: false,
		media: query,
		onchange: null,
		addEventListener: vi.fn(),
		removeEventListener: vi.fn(),
		dispatchEvent: vi.fn()
	}))
});

// Polyfill for btoa/atob functions needed for JWT handling in jsdom
if (typeof btoa === 'undefined') {
	global.btoa = (str: string) => Buffer.from(str, 'binary').toString('base64');
}

if (typeof atob === 'undefined') {
	global.atob = (str: string) => Buffer.from(str, 'base64').toString('binary');
}

// Make sure polyfills are available globally for all environments
if (typeof globalThis.btoa === 'undefined') {
	globalThis.btoa = (str: string) => Buffer.from(str, 'binary').toString('base64');
}

if (typeof globalThis.atob === 'undefined') {
	globalThis.atob = (str: string) => Buffer.from(str, 'base64').toString('binary');
}

// Mock localStorage for tests
const localStorageMock = {
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
	value: localStorageMock
});

// add more mocks here if you need them
