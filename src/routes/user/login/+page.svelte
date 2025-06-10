<script lang="ts">
	import { goto } from '$app/navigation';
	import HeadingFormat from '$lib/components/HeadingFormat.svelte';
	import { user, decodeJWTUser } from '$lib/stores/user';

	let email: string = '';
	let password: string = '';
	let isLoading: boolean = false;
	let errorMessage: string = '';

	async function handleLogin() {
		if (!email || !password) {
			errorMessage = 'Please complete all fields';
			return;
		}

		isLoading = true;
		errorMessage = '';

		try {
			// Use direct import instead of dynamic import
			const { api } = await import('$lib/ApiWrapper');
			await api.login(email, password);

			// Immediately update user store with the new token
			const token = api.getToken();
			if (token) {
				const userData = decodeJWTUser(token);
				if (userData) {
					user.set(userData);
				}
			}

			goto('/');
		} catch (error) {
			console.error('🔥 Login error:', error);
			if (error instanceof Error && error.message.includes('401')) {
				errorMessage = 'Invalid credentials';
			} else {
				errorMessage = 'Connection error. Please try again later.';
			}
		} finally {
			isLoading = false;
		}
	}

	function handleSubmit(event: Event) {
		event.preventDefault();
		handleLogin();
	}

	// Define a global function for testing
	if (typeof window !== 'undefined') {
		(window as typeof window & { testLogin?: typeof handleLogin }).testLogin = handleLogin;
	}
</script>

<svelte:head>
	<title>Login - CAZSS</title>
</svelte:head>

<!-- Login Page -->
<div class="login-page login-container flex min-h-screen flex-col items-center justify-center p-4">
	<div class="login-card w-full max-w-md rounded-2xl px-12 py-12 shadow-2xl">
		<!-- Header -->
		<div class="mb-10 text-center">
			<HeadingFormat as="h1" variant="primary">
				Welcome to <span class="text-accent-red font-bold">CAZSS!</span>
			</HeadingFormat>
			<p class="text-gray-medium mt-2 text-lg">Make it simple</p>
		</div>

		<!-- Login Form -->
		<form onsubmit={handleSubmit} class="space-y-6">
			<!-- Email Input -->
			<div>
				<input
					type="email"
					bind:value={email}
					placeholder="Email address"
					disabled={isLoading}
					name="email"
					class="login-input"
				/>
			</div>

			<!-- Password Input -->
			<div>
				<input
					type="password"
					bind:value={password}
					placeholder="Password"
					disabled={isLoading}
					name="password"
					class="login-input"
				/>
			</div>

			<!-- Error Message -->
			{#if errorMessage}
				<div class="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
					{errorMessage}
				</div>
			{/if}

			<!-- Login Button -->
			<div class="pt-6">
				<button type="submit" disabled={isLoading || !email || !password} class="login-button">
					{#if isLoading}
						<span class="flex items-center justify-center">
							<svg
								class="mr-3 -ml-1 h-5 w-5 animate-spin text-white"
								xmlns="http://www.w3.org/2000/svg"
								fill="none"
								viewBox="0 0 24 24"
							>
								<circle
									class="opacity-25"
									cx="12"
									cy="12"
									r="10"
									stroke="currentColor"
									stroke-width="4"
								></circle>
								<path
									class="opacity-75"
									fill="currentColor"
									d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
								></path>
							</svg>
							Logging in...
						</span>
					{:else}
						LOGIN
					{/if}
				</button>
			</div>
		</form>
	</div>

	<!-- Footer -->
	<div class="mt-8 text-center">
		<p class="text-gray-medium text-sm">© CAZSS, Inc</p>
	</div>
</div>

<style>
	/* Enhanced login page styling */
	:global(.login-container) {
		min-height: 100vh;
		background: linear-gradient(135deg, #f5f7fa 0%, #e1e5eb 100%);
	}

	/* Custom input styling */
	.login-input {
		background-color: var(--color-gray-light);
		border: 2px solid transparent;
		border-radius: 1rem;
		padding: 1rem 1.5rem;
		width: 100%;
		font-size: 1rem;
		transition: all 0.3s ease;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
		height: 3.5rem;
	}

	.login-input:focus {
		outline: none;
		border-color: var(--color-accent-red);
		box-shadow: 0 0 0 3px rgba(175, 22, 36, 0.1);
		background-color: white;
	}

	.login-input:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	/* Enhanced button styling */
	.login-button {
		width: 100% !important;
		height: 3.5rem !important;
		background: linear-gradient(
			135deg,
			var(--color-accent-red) 0%,
			var(--color-accent-red-dark) 100%
		) !important;
		border: none !important;
		border-radius: 3rem !important;
		font-weight: 700 !important;
		text-transform: uppercase !important;
		color: white !important;
		font-size: 1rem !important;
		transition: all 0.3s ease !important;
		box-shadow: 0 4px 15px rgba(175, 22, 36, 0.3) !important;
		cursor: pointer !important;
	}

	.login-button:hover:not(:disabled) {
		transform: translateY(-2px) !important;
		box-shadow: 0 8px 25px rgba(175, 22, 36, 0.4) !important;
		background: linear-gradient(
			135deg,
			var(--color-accent-red-dark) 0%,
			var(--color-accent-red) 100%
		) !important;
	}

	.login-button:active:not(:disabled) {
		transform: translateY(0) !important;
		box-shadow: 0 2px 10px rgba(175, 22, 36, 0.3) !important;
	}

	.login-button:disabled {
		opacity: 0.6 !important;
		cursor: not-allowed !important;
		transform: none !important;
		box-shadow: 0 2px 10px rgba(175, 22, 36, 0.2) !important;
	}

	:global(.login-page) :global(button[type='submit']) {
		width: 100% !important;
		height: 3.5rem !important;
		background: linear-gradient(
			135deg,
			var(--color-accent-red) 0%,
			var(--color-accent-red-dark) 100%
		) !important;
		border: none !important;
		border-radius: 3rem !important;
		font-weight: 700 !important;
		text-transform: uppercase !important;
		color: white !important;
		font-size: 1rem !important;
		transition: all 0.3s ease !important;
		box-shadow: 0 4px 15px rgba(175, 22, 36, 0.3) !important;
		cursor: pointer !important;
	}

	/* Card styling */
	:global(.login-card) {
		backdrop-filter: blur(10px);
		background: rgba(255, 255, 255, 0.95);
		border: 1px solid rgba(255, 255, 255, 0.2);
	}

	/* Disable hover effects on login heading */
	:global(.login-page) :global(h1) {
		cursor: default !important;
		pointer-events: none !important;
	}

	:global(.login-page) :global(h1):hover {
		color: inherit !important;
	}
</style>
