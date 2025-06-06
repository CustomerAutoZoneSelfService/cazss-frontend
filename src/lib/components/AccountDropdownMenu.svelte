<script lang="ts">
	import LoadingSVG from './LoadingSVG.svelte';
	import { goto } from '$app/navigation';
	import { clearUser } from '$lib/stores/user';

	type Props = {
		email: string;
		username: string;
		showAccountDropdown: boolean;
	};

	let { email, username, showAccountDropdown }: Props = $props();

	let isSigningOut = $state(false);

	async function signOut() {
		console.log('Signing out...');
		isSigningOut = true;

		try {
			// Use dynamic import to avoid circular dependencies and hot module reloading issues
			const { api } = await import('$lib/ApiWrapper');

			// Clear token from ApiWrapper and localStorage
			api.clearToken();
			localStorage.removeItem('cazss_access_token');

			// Clear user data from store
			clearUser();

			// Navigate to login page
			await goto('/user/login');
		} catch (error) {
			console.error('Error during sign out:', error);
			// Even if there's an error, try to redirect to login
			window.location.replace('/user/login');
		} finally {
			isSigningOut = false;
		}
	}
</script>

<!-- Only shows the dropdown when the user button is triggered -->
{#if showAccountDropdown}
	<div
		class="account-dropdown-menu bg-gray-light border-gray-medium absolute bottom-full ml-2 rounded-lg border-1"
	>
		<div class="user-info mt-1 px-5 py-2">
			<div class="font-bold text-gray-800">{username}</div>
			<div class="text-sm text-gray-600">{email}</div>
		</div>
		<button
			class="bg-gray-light mt-1 w-full rounded-b-lg py-2 text-gray-800 duration-300 hover:brightness-80 hover:transition disabled:cursor-not-allowed disabled:opacity-50"
			onclick={signOut}
			disabled={isSigningOut}
			aria-label="Sign out of account"
		>
			{#if isSigningOut}
				<div class="flex items-center justify-center gap-2">
					<LoadingSVG />
					Signing out...
				</div>
			{:else}
				Sign out
			{/if}
		</button>
	</div>
{/if}

<!-- Only shows the sign out overlay when the sign out button is triggered -->
{#if isSigningOut}
	<div class="sign-out-overlay fixed inset-0 z-50 size-full bg-black opacity-50 select-none">
		<div class="flex h-screen w-screen items-center justify-center text-4xl text-white">
			<LoadingSVG />
			Signing out
		</div>
	</div>
{/if}
