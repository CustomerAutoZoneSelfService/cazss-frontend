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
		handleChange,
		isAlert = false
	}: Props = $props();

	const getAlertStyle = (isAlert: boolean): string => {
		if (isAlert) {
			return '!border-red-500 border-2';
		} else {
			return 'border border-gray-300';
		}
	};

	let textBoxSizeCSS = InputBoxSizeTranslations[boxSize];

	// Make computedStyle reactive using $derived so it updates when isAlert changes
	let computedStyle = $derived(
		`${textBoxSizeCSS} bg-gray-light my-3 h-10 rounded-2xl px-3 shadow-xl ${getAlertStyle(isAlert)}`
	);
</script>

{#if name || caption}
	<label for={name}>
		{caption}
	</label>
{/if}

<input
	{name}
	class={computedStyle}
	{type}
	bind:value={text}
	disabled={isDisabled}
	{placeholder}
	oninput={handleInput}
	onchange={handleChange}
/>
