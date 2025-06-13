import type { Page, TestInfo } from '@playwright/test';

export async function initE2EMocked(page: Page, testInfo: TestInfo): Promise<void> {
	const isMockedFromEnv = testInfo.project?.use?.launchOptions?.env?.VITE_USE_MOCK === 'true';

	await page.addInitScript((mock) => {
		window.E2E_MOCKED = mock;
		// Also set window.ENV for mockApiWrapper compatibility
		window.ENV = {
			VITE_API_URL: 'http://localhost:5173',
			VITE_USE_MOCK: mock ? 'true' : 'false'
		};
	}, isMockedFromEnv);
}

declare global {
	interface Window {
		E2E_MOCKED?: boolean; // The declaration in src only applies to that directory. Not to e2e.
		ENV?: {
			VITE_API_URL: string;
			VITE_USE_MOCK: string;
		};
	}
}
