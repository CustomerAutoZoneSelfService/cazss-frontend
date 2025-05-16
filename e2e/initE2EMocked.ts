// e2e/initE2EMocked.ts
import type { Page, TestInfo } from '@playwright/test';

export async function initE2EMocked(page: Page, testInfo: TestInfo): Promise<void> {
	const isMockedFromEnv = testInfo.project?.use?.launchOptions?.env?.E2E_MOCKED === 'true';

	await page.evaluate((isMocked) => {
		window.E2E_MOCKED = isMocked;
		console.log(isMocked);
		console.log(window.E2E_MOCKED);
		// Helps create a global variable so AppContainer can access it,
		// which results in it knowing if it's going to use the mock version or not.
	}, isMockedFromEnv);
}

declare global {
	interface Window {
		E2E_MOCKED?: boolean; // The declaration in src only applies to that directory. Not to e2e.
	}
}
