<script>
	import UserAccountDropdown from '$lib/components/UserAccountDropdown.svelte';

	let username = "John Doe";
	let email = "some@domain.com";
	let isUserDisplayOn = $state(false);

	function handleMenuOpen() {
		isUserDisplayOn = true
		console.log('open')
		document.body.addEventListener('click', handleMenuClose)
	}

	function handleMenuClose() {
		isUserDisplayOn = false
		console.log('close')
		document.body.removeEventListener('click', handleMenuClose)
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
		<button on:click|stopPropagation={handleMenuOpen}>{username} (Click me)</button>
		<UserAccountDropdown username = {username} email = {email} isUserDisplayOn = {isUserDisplayOn}/>
	</div>
</div>

<style>
    .dummy-flex {
        height: 100vh;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
    }

    button {
        text-align: left;
    }

    .user-menu-wrapper {
        position: relative;
    }
</style>