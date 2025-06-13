import { defineConfig } from '@playwright/test';

export default defineConfig({
	webServer: {
		command: 'npm run dev',
		port: 5173,
		reuseExistingServer: !process.env.CI,
		env: {
			NODE_ENV: 'development',
			MODE: 'development'
		}
	},

	projects: [
		{
			name: 'integration',
			testDir: './e2e/integration',
			use: {
				baseURL: 'http://localhost:5173'
			}
		},
		{
			name: 'mock',
			testDir: './e2e/mock',
			use: {
				baseURL: 'http://localhost:5173',
				launchOptions: {
					env: {
						VITE_USE_MOCK: 'true'
					}
				}
			}
		}
	]
});
