<script lang="ts">
	import TextArea from '$lib/components/TextArea.svelte';
	let text: string;
</script>

<TextArea bind:text placeholder="Some text..." useMonospace={true} transparentBackground={true} />
