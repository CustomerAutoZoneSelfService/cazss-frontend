<script lang="ts">
	import UserAccountDropdown from '$lib/components/UserAccountDropdown.svelte';

	let username = 'John Doe';
	let email = 'some@domain.com';
	let isUserDisplayOn = $state(false);

	function handleMenuOpen(event: Event) {
		event.stopPropagation();
		isUserDisplayOn = true;
		console.log('open');
		document.body.addEventListener('click', handleMenuClose);
	}

	function handleMenuClose(event: Event) {
		event.stopPropagation();
		isUserDisplayOn = false;
		console.log('close');
		document.body.removeEventListener('click', handleMenuClose);
	}
</script>
<div class="dummy-flex">
	<div>
		qwerty
	</div>
	<div>
		asdf
	</div>
	<div class="user-menu-wrapper">
		<button id="user-button" onclick={handleMenuOpen}>{username} (Click me)</button>
		<UserAccountDropdown username={username} email={email} isUserDisplayOn={isUserDisplayOn} />
	</div>
</div>

<style>
    .dummy-flex {
        height: 100vh;
        display: flex;
        padding-left: 10px;
        flex-direction: column;
        justify-content: space-around;
    }

    button {
        text-align: left;
    }

    .user-menu-wrapper {
        position: relative;
    }
</style>