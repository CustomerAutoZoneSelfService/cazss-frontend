<script lang="ts">
	import { onMount } from 'svelte';
	import { api } from '$lib/ApiWrapper';
	import { user, decodeJWTUser } from '$lib/stores/user';
	import Button from '$lib/components/Button.svelte';

	// Test credentials provided
	const TEST_CREDENTIALS = [
		{ email: 'a01562951@tec.mx', password: 'alpargatas33', role: 'USER' },
		{ email: 'a01563117@tec.mx', password: 'alpargatas33', role: 'ADMIN' }
	];

	interface TestResult {
		timestamp: string;
		test: string;
		status: 'success' | 'error';
		details: string;
	}

	let selectedCredential = 0;
	let isLoading = false;
	let testResults: TestResult[] = [];
	let currentBackendUrl = '';
	let useMock = true;

	onMount(() => {
		// Check current configuration
		currentBackendUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080';
		useMock = import.meta.env.VITE_USE_MOCK !== 'false';

		console.log('🔧 Backend Test Page Loaded');
		console.log('🌐 Current Backend URL:', currentBackendUrl);
		console.log('🔧 Using Mock:', useMock);
		console.log('🔧 API Instance Available:', !!api);
	});

	function addTestResult(test: string, status: 'success' | 'error', details: unknown) {
		testResults = [
			...testResults,
			{
				timestamp: new Date().toLocaleTimeString(),
				test,
				status,
				details: typeof details === 'object' ? JSON.stringify(details, null, 2) : String(details)
			}
		];
	}

	async function testLogin() {
		isLoading = true;
		const credentials = TEST_CREDENTIALS[selectedCredential];

		try {
			addTestResult('🧪 Testing Login', 'success', `Attempting login with ${credentials.email}`);

			// Clear any existing tokens
			api.clearToken();

			// Attempt login
			const response = await api.login(credentials.email, credentials.password);

			addTestResult('✅ Login Success', 'success', {
				message: response.message,
				hasAccessToken: !!response.accessToken,
				hasRefreshToken: !!response.refreshToken,
				accessTokenLength: response.accessToken?.length || 0,
				refreshTokenLength: response.refreshToken?.length || 0
			});

			// Test token decoding
			if (response.accessToken) {
				const userData = decodeJWTUser(response.accessToken);
				if (userData) {
					user.set(userData);
					addTestResult('✅ JWT Decode Success', 'success', userData);
				} else {
					addTestResult('❌ JWT Decode Failed', 'error', 'Could not decode access token');
				}
			}
		} catch (error: unknown) {
			const errorObj = error as Error;
			addTestResult('❌ Login Failed', 'error', {
				message: errorObj.message,
				stack: errorObj.stack
			});
		} finally {
			isLoading = false;
		}
	}

	async function testRefresh() {
		isLoading = true;

		try {
			const refreshToken = api.getRefreshToken();
			if (!refreshToken) {
				addTestResult(
					'❌ Refresh Test Failed',
					'error',
					'No refresh token available. Login first.'
				);
				return;
			}

			addTestResult('🧪 Testing Refresh', 'success', 'Attempting token refresh');

			// Make a request that should trigger token refresh
			// We'll make a request to a protected endpoint
			const response = await api.get('/services');

			addTestResult('✅ Refresh Success', 'success', {
				message: 'Request completed successfully',
				hasNewToken: !!api.getToken(),
				responseType: typeof response
			});
		} catch (error: unknown) {
			const errorObj = error as Error;
			addTestResult('❌ Refresh Failed', 'error', {
				message: errorObj.message,
				stack: errorObj.stack
			});
		} finally {
			isLoading = false;
		}
	}

	async function testProtectedEndpoint() {
		isLoading = true;

		try {
			addTestResult('🧪 Testing Protected Endpoint', 'success', 'Attempting to access /services');

			const response = await api.getAllServices();

			addTestResult('✅ Protected Endpoint Success', 'success', {
				message: 'Services endpoint accessible',
				serviceCount: Array.isArray(response) ? response.length : 'N/A',
				sampleData: Array.isArray(response) ? response.slice(0, 2) : response
			});
		} catch (error: unknown) {
			const errorObj = error as Error;
			addTestResult('❌ Protected Endpoint Failed', 'error', {
				message: errorObj.message,
				stack: errorObj.stack
			});
		} finally {
			isLoading = false;
		}
	}

	function clearResults() {
		testResults = [];
	}

	function logout() {
		api.clearToken();
		user.set(null);
		addTestResult('🚪 Logout', 'success', 'Tokens cleared and user logged out');
	}
</script>

<svelte:head>
	<title>Backend Testing - CAZSS Frontend</title>
</svelte:head>

<div class="container mx-auto max-w-4xl p-6">
	<div class="mb-8">
		<h1 class="mb-4 text-3xl font-bold text-gray-900">🧪 Backend Connection Testing</h1>
		<div class="mb-6 rounded-lg border border-blue-200 bg-blue-50 p-4">
			<h2 class="mb-2 text-lg font-semibold text-blue-900">Current Configuration</h2>
			<div class="space-y-1 text-sm">
				<p>
					<strong>Backend URL:</strong>
					<code class="rounded bg-blue-100 px-2 py-1">{currentBackendUrl}</code>
				</p>
				<p>
					<strong>Using Mock:</strong>
					<span
						class="rounded px-2 py-1 text-xs font-medium {useMock
							? 'bg-yellow-100 text-yellow-800'
							: 'bg-green-100 text-green-800'}"
					>
						{useMock ? '🔧 MOCK' : '🌐 REAL'}
					</span>
				</p>
			</div>
		</div>
	</div>

	<!-- Test Controls -->
	<div class="mb-6 rounded-lg border border-gray-200 bg-white p-6">
		<h2 class="mb-4 text-xl font-semibold text-gray-900">Test Controls</h2>

		<!-- Credential Selection -->
		<div class="mb-4">
			<label for="credential-select" class="mb-2 block text-sm font-medium text-gray-700"
				>Test Credentials:</label
			>
			<select
				id="credential-select"
				bind:value={selectedCredential}
				class="w-full rounded-md border border-gray-300 p-2"
			>
				{#each TEST_CREDENTIALS as cred, index (index)}
					<option value={index}>{cred.email} ({cred.role})</option>
				{/each}
			</select>
		</div>

		<!-- Test Buttons -->
		<div class="grid grid-cols-2 gap-3 md:grid-cols-4">
			<Button on:click={testLogin} disabled={isLoading} class="w-full">
				{#if isLoading}🔄{:else}🔐{/if} Login Test
			</Button>

			<Button on:click={testRefresh} disabled={isLoading} class="w-full">
				{#if isLoading}🔄{:else}🔄{/if} Refresh Test
			</Button>

			<Button on:click={testProtectedEndpoint} disabled={isLoading} class="w-full">
				{#if isLoading}🔄{:else}🛡️{/if} Protected API
			</Button>

			<Button on:click={logout} disabled={isLoading} class="w-full bg-red-600 hover:bg-red-700">
				🚪 Logout
			</Button>
		</div>

		<div class="mt-4 flex gap-2">
			<Button on:click={clearResults} class="bg-gray-600 hover:bg-gray-700">
				🧹 Clear Results
			</Button>
		</div>
	</div>

	<!-- User State -->
	{#if $user}
		<div class="mb-6 rounded-lg border border-green-200 bg-green-50 p-4">
			<h3 class="mb-2 text-lg font-semibold text-green-900">👤 Current User</h3>
			<div class="space-y-1 text-sm">
				<p><strong>ID:</strong> {$user.user_id}</p>
				<p><strong>Username:</strong> {$user.username}</p>
				<p><strong>Email:</strong> {$user.email}</p>
				<p>
					<strong>Role:</strong>
					<span class="rounded bg-green-100 px-2 py-1 text-xs font-medium text-green-800"
						>{$user.role}</span
					>
				</p>
			</div>
		</div>
	{/if}

	<!-- Test Results -->
	<div class="rounded-lg border border-gray-200 bg-white p-6">
		<div class="mb-4 flex items-center justify-between">
			<h2 class="text-xl font-semibold text-gray-900">Test Results</h2>
			<span class="text-sm text-gray-500">{testResults.length} tests run</span>
		</div>

		{#if testResults.length === 0}
			<p class="py-8 text-center text-gray-500">
				No tests run yet. Click a test button above to start.
			</p>
		{:else}
			<div class="max-h-96 space-y-4 overflow-y-auto">
				{#each testResults as result, index (index)}
					<div
						class="rounded-lg border border-gray-200 p-4 {result.status === 'success'
							? 'border-green-200 bg-green-50'
							: 'border-red-200 bg-red-50'}"
					>
						<div class="mb-2 flex items-start justify-between">
							<h3
								class="font-medium {result.status === 'success'
									? 'text-green-900'
									: 'text-red-900'}"
							>
								{result.test}
							</h3>
							<span class="text-xs text-gray-500">{result.timestamp}</span>
						</div>
						<pre
							class="overflow-x-auto rounded bg-gray-100 p-2 text-xs whitespace-pre-wrap">{result.details}</pre>
					</div>
				{/each}
			</div>
		{/if}
	</div>
</div>
