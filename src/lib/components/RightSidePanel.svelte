<script lang="ts">
	import Button from '$lib/components/Button.svelte';
	export let visible = false;
	export let onClose: () => void;
</script>

{#if visible}
	<div
		class="overlay"
		role="button"
		tabindex="0"
		on:click={onClose}
		on:keydown={(e) => {
			if (e.key === 'Enter' || e.key === ' ') {
				onClose();
			}
		}}
	></div>
	<aside class="panel">
		<Button
			variant="text"
			size="lg"
			class="absolute top-4 right-4 z-50 cursor-pointer"
			onClick={onClose}
			iconOnly
		>
			✕
		</Button>
		<slot />
	</aside>
{/if}

<style>
	.overlay {
		position: fixed;
		inset: 0;
		background-color: rgba(0, 0, 0, 0.3);
		z-index: 40;
	}
	.panel {
		position: fixed;
		right: 0;
		top: 0;
		height: 100%;
		width: 32rem;
		background: white;
		box-shadow: -2px 0 10px rgba(0, 0, 0, 0.2);
		z-index: 50;
		display: flex;
		flex-direction: column;
		padding: 2rem;
		overflow-y: auto;
		animation: slide-in 0.3s ease-out;
	}
	@keyframes slide-in {
		from {
			transform: translateX(100%);
			opacity: 0;
		}
		to {
			transform: translateX(0);
			opacity: 1;
		}
	}
</style>
