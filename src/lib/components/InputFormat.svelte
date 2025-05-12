<script lang="ts">
	export let icon = '';
	export let size = 'text-base'; // Tailwind size like text-sm, text-lg
	export let color = 'text-black';
	export let placeholder = 'Enter text...';

	import { writable } from 'svelte/store';
	export let value = writable('');
</script>

<div class="flex items-center gap-2 rounded-md border border-gray-300 px-3 py-2">
	{#if icon}
		<i class={`icon-${icon} ${color} ${size}`}></i>
	{/if}
	<input
		type="text"
		class={`w-full bg-transparent outline-none ${size} ${color}`}
		{placeholder}
		on:input={(e) => value.set((e.target as HTMLInputElement).value)}
	/>
</div>
