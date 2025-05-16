import { defineConfig } from '@playwright/test';

export default defineConfig({
	webServer: {
		command: 'npm run build && npm run preview',
		port: 4173
	},

	projects: [
		{
			name: 'integration',
			testDir: './e2e/integration',
			use: {
				launchOptions: {
					env: {
						E2E_MOCKED: 'false' // Override for this project
					}
				}
			}
		},
		{
			name: 'mock',
			testDir: './e2e/mock',
			use: {
				launchOptions: {
					env: {
						E2E_MOCKED: 'true' // Override for this project
					}
				}
			}
		}
	]
});
