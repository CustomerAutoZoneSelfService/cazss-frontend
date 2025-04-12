<script lang="ts">
	import LoadingSVG from './LoadingSVG.svelte';

	let props = $props();
	let isSigningOut = $state(false);

	function signOut() {
		console.log('Signing out...');
		isSigningOut = true;
	}
</script>

<!--
IMPORTANT NOTE ON HOW TO USE
This component should be inside a div wrapper that includes only the username button.
The wrapper needs to have position: relative. This allows the menu to always be on top of the
username button, regardless of font size/zoom.
On top of that, make sure to include the Event Handlers in the DummySidebar.svelte in order
to close and open the menu.
-->

<!-- Only shows the dropdown when the user button is triggered -->
{#if props.isUserDisplayOn}
	<div class="user-menu bg-[var(--color-gray-light)] border-[var(--color-gray-medium)]">
		<div class="user-info">
			<span>{props.username}</span>
			<span>{props.email}</span>
		</div>
		<button class="bg-[var(--color-gray-light)]" onclick={signOut} style="margin-top: 5px">Sign out</button>
	</div>
{/if}

<!-- Only shows the sign out overlay when the sign out button is triggered -->
{#if isSigningOut}
	<div class="overlay">
		<div class="overlay-text">
			<LoadingSVG />
			Signing out
		</div>
	</div>
{/if}

<style>
    .user-menu {
        position: absolute;
        width: 200px;
        margin-left: 10px;
        border-width: 1px;
        bottom: 100%;
        border-radius: 10px;
    }

    .user-info {
        margin-top: 5px;
        padding: 0 20px;
    }

    span {
        font-weight: bold;
    }

    button {
        width: 100%;
        padding: 5px 0;
        border-radius: 0 0 10px 10px;
    }

    button:hover {
        transition: 0.2s;
        filter: brightness(0.95);
    }

    .overlay {
        position: fixed;
        width: 100%;
        height: 100%;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: rgba(0, 0, 0, 0.5);
        z-index: 2;
        cursor: default;
    }

    .overlay-text {
        position: absolute;
        display: inline;
        top: 50%;
        left: 50%;
        font-size: 50px;
        color: white;
        transform: translate(-50%, -50%);
        -ms-transform: translate(-50%, -50%);
    }
</style>