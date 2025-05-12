<script lang="ts">
	import TextFormat from '$lib/components/TextFormat.svelte';
</script>

<main class="mx-auto my-8 max-w-2/3 space-y-4">
	<h1 class="text-3xl font-bold">Text format component</h1>

	<div>
		<h2 class="text-2xl">as</h2>

		<TextFormat as="p">p (default) as</TextFormat>
		<TextFormat as="span">span as</TextFormat>
		<TextFormat as="div">div as</TextFormat>
		<TextFormat as="label">label as</TextFormat>
	</div>

	<div>
		<h2 class="text-2xl">variant</h2>

		<TextFormat variant="primary">primary (default) variant</TextFormat>
		<TextFormat variant="secondary">secondary variant</TextFormat>
		<TextFormat variant="muted">muted variant</TextFormat>
	</div>

	<div>
		<h2 class="text-2xl">size</h2>

		<TextFormat size="subtitle">subtitle size</TextFormat>
		<TextFormat size="body">body (default) size</TextFormat>
		<TextFormat size="caption">caption size</TextFormat>
		<TextFormat size="label">label size</TextFormat>
	</div>
</main>
