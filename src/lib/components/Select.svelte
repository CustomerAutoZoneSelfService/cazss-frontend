<script lang="ts">
	export let options: { value: string | number; label: string }[] = [];
	export let selected: string | number = '';
	export let disabled: boolean = false;
</script>

<div class="relative w-48">
	<select
		class="bg-gray-light w-full appearance-none rounded-2xl px-4 py-1 pr-10 text-black shadow-xl {disabled
			? 'cursor-not-allowed'
			: ''}"
		{disabled}
		bind:value={selected}
	>
		{#each options as option (option.value)}
			<option value={option.value}>{option.label}</option>
		{/each}
	</select>

	<div class="pointer-events-none absolute inset-y-0 right-3 flex items-center">
		<div
			class="h-0 w-2 border-t-8 border-r-8 border-l-8 border-t-[#B7B5B5] border-r-transparent border-l-transparent"
		></div>
	</div>
</div>
