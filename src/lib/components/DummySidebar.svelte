<script lang="ts">
	import AccountDropdownMenu from '$lib/components/AccountDropdownMenu.svelte';

	let username = 'John Doe';
	let email = 'some@domain.com';
	let isAccountDropdownMenuOn = $state(false);

	function handleAccountDropdownMenuToggle(event: Event) {
		event.stopPropagation();
		isAccountDropdownMenuOn = !isAccountDropdownMenuOn;
		if (isAccountDropdownMenuOn) {
			document.body.addEventListener('click', handleAccountDropdownMenuToggle);
		} else {
			document.body.removeEventListener('click', handleAccountDropdownMenuToggle);
		}
	}
</script>

<div class="app-container">
	<div class="dummy-flex">
		<div>
			qwerty
		</div>
		<div>
			asdf
		</div>
		<div class="account-menu-wrapper">
			<button id="username-button" onclick={handleAccountDropdownMenuToggle}>{username} (Click me)</button>
			<AccountDropdownMenu username={username} email={email} isAccountDropdownMenuOn={isAccountDropdownMenuOn} />
		</div>
	</div>
	<span class="outside-component">
		Click me too!
	</span>
</div>

<style>
    .app-container {
        display: flex;
    }

    .dummy-flex {
        width: 200px;
        height: 100vh;
        display: flex;
        padding-left: 10px;
        flex-direction: column;
        justify-content: space-around;
    }

    button {
        text-align: left;
    }

    .account-menu-wrapper {
        position: relative;
    }
</style>