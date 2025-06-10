<script lang="ts">
	import { page } from '$app/stores';
	import { browser } from '$app/environment';
	import AppContainer from '$lib/components/AppContainer.svelte';
	import Sidebar from '$lib/components/Sidebar.svelte';
	import '../app.css';

	// Import mockApiWrapper to auto-initialize mocks in development
	import '$lib/mockApiWrapper';

	let { children } = $props();

	// Check if current route is an auth route (login, register, etc.)
	const isAuthRoute = $derived($page.route.id?.startsWith('/user/') || false);

	// Loading state to prevent component conflicts during auth check
	let authCheckReady = $state(false);

	// Wait for auth check completion on client side
	if (browser) {
		// Short delay to allow auth guard to complete
		setTimeout(() => {
			authCheckReady = true;
		}, 100);
	} else {
		// Server side rendering - always ready
		authCheckReady = true;
	}
</script>

{#if authCheckReady}
	{#if isAuthRoute}
		<!-- Auth layout without sidebar -->
		{@render children()}
	{:else}
		<!-- Main app layout with sidebar -->
		<AppContainer>
			<Sidebar />
			<div class="grow overflow-y-auto p-8">
				{@render children()}
			</div>
		</AppContainer>
	{/if}
{:else}
	<!-- Loading state while auth check completes -->
	<div class="flex h-screen w-screen items-center justify-center bg-gray-50">
		<div class="text-center">
			<div
				class="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-red-600"
			></div>
			<p class="text-gray-600">Cargando...</p>
		</div>
	</div>
{/if}
