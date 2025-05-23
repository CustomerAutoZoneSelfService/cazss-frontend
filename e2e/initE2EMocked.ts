import type { Page, TestInfo } from '@playwright/test';

export async function initE2EMocked(page: Page, testInfo: TestInfo): Promise<void> {
	const isMockedFromEnv = testInfo.project?.use?.launchOptions?.env?.E2E_MOCKED === 'true';

	await page.addInitScript((mock) => {
		window.E2E_MOCKED = mock;
	}, isMockedFromEnv);
}

declare global {
	interface Window {
		E2E_MOCKED?: boolean; // The declaration in src only applies to that directory. Not to e2e.
	}
}
