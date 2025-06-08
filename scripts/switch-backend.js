#!/usr/bin/env node

/**
 * Script to switch between mock backend and real backend
 * Usage:
 *   node scripts/switch-backend.js mock
 *   node scripts/switch-backend.js real [BACKEND_URL]
 */

import fs from 'fs';
import path from 'path';

const args = process.argv.slice(2);
const mode = args[0];
const backendUrl = args[1];

const envFile = '.env.local';
const envPath = path.resolve(envFile);

function updateEnvFile(url, useMock) {
	let envContent = '';

	if (fs.existsSync(envPath)) {
		envContent = fs.readFileSync(envPath, 'utf8');
	}

	// Remove existing VITE_API_URL and VITE_USE_MOCK lines
	envContent = envContent
		.split('\n')
		.filter((line) => !line.startsWith('VITE_API_URL=') && !line.startsWith('VITE_USE_MOCK='))
		.join('\n');

	// Add new configuration
	const newConfig = [`VITE_API_URL=${url}`, `VITE_USE_MOCK=${useMock}`];

	// Append to existing content
	const finalContent = envContent.trim() + '\n' + newConfig.join('\n') + '\n';

	fs.writeFileSync(envPath, finalContent);

	console.log(`✅ Updated ${envFile}:`);
	console.log(`   VITE_API_URL=${url}`);
	console.log(`   VITE_USE_MOCK=${useMock}`);
}

switch (mode) {
	case 'mock':
		updateEnvFile('http://localhost:5173', 'true');
		console.log('🔧 Switched to MOCK backend');
		console.log('💡 Run: pnpm dev');
		break;

	case 'real':
		if (!backendUrl) {
			console.error('❌ Error: Backend URL required for real mode');
			console.log('💡 Usage: node scripts/switch-backend.js real http://your-backend-url');
			process.exit(1);
		}
		updateEnvFile(backendUrl, 'false');
		console.log('🌐 Switched to REAL backend');
		console.log(`🔗 Backend URL: ${backendUrl}`);
		console.log('💡 Run: pnpm dev');
		break;

	default:
		console.log('❓ Usage:');
		console.log('  🔧 Mock backend:  node scripts/switch-backend.js mock');
		console.log('  🌐 Real backend:  node scripts/switch-backend.js real http://your-backend-url');
		process.exit(1);
}
