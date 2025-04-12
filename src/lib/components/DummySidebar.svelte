<script lang="ts">
	import UserAccountDropdown from '$lib/components/UserAccountDropdown.svelte';

	let username = 'John Doe';
	let email = 'some@domain.com';
	let isUserDisplayOn = $state(false);

	function handleMenuOpen(event: Event) {
		event.stopPropagation();
		if (isUserDisplayOn) {
			isUserDisplayOn = false;
			document.body.removeEventListener('click', handleMenuClose);
		} else {
			isUserDisplayOn = true;
			document.body.addEventListener('click', handleMenuClose);
		}
	}

	function handleMenuClose(event: Event) {
		event.stopPropagation();
		isUserDisplayOn = false;
		document.body.removeEventListener('click', handleMenuClose);
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
		<div class="user-menu-wrapper">
			<button id="user-button" onclick={handleMenuOpen}>{username} (Click me)</button>
			<UserAccountDropdown username={username} email={email} isUserDisplayOn={isUserDisplayOn} />
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

    .user-menu-wrapper {
        position: relative;
    }
</style>