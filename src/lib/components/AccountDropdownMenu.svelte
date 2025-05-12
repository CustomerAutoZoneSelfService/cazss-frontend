<script lang="ts">
	import LoadingSVG from './LoadingSVG.svelte';

	type Props = {
		email: string;
		username: string;
		showAccountDropdown: boolean;
	};

	let { email, username, showAccountDropdown }: Props = $props();

	let isSigningOut = $state(false);

	function signOut() {
		console.log('Signing out...');
		isSigningOut = true;
	}
</script>

<!-- Only shows the dropdown when the user button is triggered -->
{#if showAccountDropdown}
	<div
		class="account-dropdown-menu bg-gray-light border-gray-medium absolute bottom-full ml-2 rounded-lg border-1"
	>
		<div class="user-info mt-1 px-5 font-bold">
			<span>{username}</span>
			<span>{email}</span>
		</div>
		<button
			class="bg-gray-light mt-1 w-full rounded-b-lg py-2 duration-300 hover:brightness-80 hover:transition"
			onclick={signOut}
			>Sign out
		</button>
	</div>
{/if}

<!-- Only shows the sign out overlay when the sign out button is triggered -->
{#if isSigningOut}
	<div class="sign-out-overlay fixed inset-0 z-2 size-full bg-black opacity-50 select-none">
		<div class="flex h-screen w-screen items-center justify-center text-4xl text-white">
			<LoadingSVG />
			Signing out
		</div>
	</div>
{/if}
