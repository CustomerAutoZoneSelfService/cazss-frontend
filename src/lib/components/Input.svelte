<script lang="ts">
	import { type Props, InputBoxSizeTranslations } from '$lib/types/InputStyles';

	let {
		type = 'text',
		text = $bindable(''),
		boxSize = 'sm',
		isDisabled = false,
		name,
		caption,
		placeholder = '',
		handleInput,
		handleChange
	}: Props = $props();

	let textBoxSizeCSS = InputBoxSizeTranslations[boxSize];
</script>

{#if name || caption}
	<label for={name}>
		{caption}
	</label>
{/if}

<input
	{name}
	class="{textBoxSizeCSS} bg-gray-light my-3 h-10 rounded-2xl px-3 shadow-xl"
	{type}
	bind:value={text}
	disabled={isDisabled}
	{placeholder}
	oninput={handleInput}
	onchange={handleChange}
/>
