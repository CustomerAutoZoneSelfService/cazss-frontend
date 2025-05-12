<script lang="ts">
	import TextFormat from './TextFormat.svelte';
	export let title: string = '';
	export let description: string = '';
	let isOpen: boolean = true;
</script>

{#if isOpen}
	<div class="absolute right-2 bottom-2">
		<div
			class="relative flex h-[88px] w-[100%] flex-col items-center justify-center rounded-xl bg-[#AF1624] p-4 px-5 text-white"
		>
			<button
				on:click={() => {
					isOpen = false;
				}}
				class="absolute top-2 right-2 text-2xl text-white">&times;</button
			>
			<TextFormat as="p" size="subtitle" variant="secondary">{title}</TextFormat>
			<TextFormat as="p" size="body" variant="none" className="text-gray-300"
				>{description}</TextFormat
			>
		</div>
	</div>
{/if}
