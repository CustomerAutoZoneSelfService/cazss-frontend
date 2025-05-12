<script lang="ts">
	import { type InputBoxSize, InputBoxSizeTranslations } from '$lib/types/InputStyles';

	export let text: string;
	export let boxSize: InputBoxSize;
	export let disabled: boolean = false;

	let textBoxSizeCSS = InputBoxSizeTranslations[boxSize];
</script>

<input
	class="{textBoxSizeCSS} bg-gray-light my-3 h-10 rounded-2xl px-3 shadow-xl"
	bind:value={text}
	{disabled}
/>
