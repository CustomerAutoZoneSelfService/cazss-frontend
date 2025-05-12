<script lang="ts">
	import AccountDropdownMenu from '$lib/components/AccountDropdownMenu.svelte';
	import Icon from '$lib/components/Icon.svelte';

	let username: string = $state('John Doe');
	let email: string = $state('some@domain.com');
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

	function getUserData() {
		username = 'SomeUsername';
		email = 'some@emaasdfasdil.com';
	}

	getUserData();
</script>

<div class="account-menu-wrapper relative mb-1">
	<button
		id="username-button"
		class="bg-accent-red hover:bg-accent-red-dark flex h-full w-full rounded-lg p-3 duration-300 hover:cursor-pointer hover:transition"
		onclick={handleAccountDropdownMenuToggle}
	>
		<Icon name="User" color="white" />
		{#if !isSidebarCollapsed}
			<span class="mt-1 ml-3 text-white">{username}</span>
		{/if}
	</button>
	<!-- The 'if' that checks the status of isAccountDropdownMenuOn needs to be in the component because
	it also contains the signing-out overlay, and clicking the Sign Out button removes the menu, which
	means it removes the overlay, too-->
	<AccountDropdownMenu {username} {email} {showAccountDropdown} />
</div>
