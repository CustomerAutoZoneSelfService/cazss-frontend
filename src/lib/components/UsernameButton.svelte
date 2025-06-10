<script lang="ts">
	import AccountDropdownMenu from '$lib/components/AccountDropdownMenu.svelte';
	import UserIcon from 'lucide-svelte/icons/user';
	import { user } from '$lib/stores/user';

	let showAccountDropdown: boolean = $state(false);

	// If we start taking several variable types, start considering
	// using a custom type like Props in Input or AccountDropdownMenu
	let { isSidebarCollapsed = false }: { isSidebarCollapsed?: boolean } = $props();

	function handleAccountDropdownMenuToggle(event: Event) {
		event.stopPropagation();
		showAccountDropdown = !showAccountDropdown;
		if (showAccountDropdown) {
			document.body.addEventListener('click', handleAccountDropdownMenuToggle);
		} else {
			document.body.removeEventListener('click', handleAccountDropdownMenuToggle);
		}
	}

	// Helper function to capitalize first letter of each word (Title Case)
	function toTitleCase(str: string): string {
		return str.replace(
			/\w\S*/g,
			(txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
		);
	}

	// Reactive computed values from store
	const displayName = $derived($user ? toTitleCase($user.username) : 'User');
	const userEmail = $derived($user?.email || '');
</script>

<div class="account-menu-wrapper relative mb-1">
	<button
		id="username-button"
		class="bg-accent-red hover:bg-accent-red-dark flex h-full w-full rounded-lg p-3 duration-300 hover:cursor-pointer hover:transition"
		onclick={handleAccountDropdownMenuToggle}
		aria-haspopup="true"
		aria-expanded={showAccountDropdown}
		aria-label="User account menu"
	>
		<UserIcon name="User" color="white" />
		{#if !isSidebarCollapsed}
			<span class="mt-1 ml-3 text-white">{displayName}</span>
		{/if}
	</button>
	<!-- The 'if' that checks the status of isAccountDropdownMenuOn needs to be in the component because
	it also contains the signing-out overlay, and clicking the Sign Out button removes the menu, which
	means it removes the overlay, too-->
	<AccountDropdownMenu username={displayName} email={userEmail} {showAccountDropdown} />
</div>
