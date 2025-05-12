<script lang="ts">
	import HeadingFormat from '$lib/components/HeadingFormat.svelte';
</script>

<main class="mx-auto my-8 max-w-2/3 space-y-4">
	<h1 class="text-3xl font-bold">Heading format component</h1>

	<div>
		<h2 class="text-2xl">As</h2>
		<HeadingFormat>Default (h1) as</HeadingFormat>
		<HeadingFormat as="h1">h1 as</HeadingFormat>
		<HeadingFormat as="h2">h2 as</HeadingFormat>
		<HeadingFormat as="h3">h3 as</HeadingFormat>
		<HeadingFormat as="h4">h4 as</HeadingFormat>
		<HeadingFormat as="h5">h5 as</HeadingFormat>
		<HeadingFormat as="h6">h6 as</HeadingFormat>
	</div>

	<div>
		<h2 class="text-2xl">Variant</h2>
		<HeadingFormat>Default (primary)</HeadingFormat>
		<HeadingFormat variant="primary">primary variant</HeadingFormat>
		<HeadingFormat variant="secondary">secondary variant</HeadingFormat>
		<HeadingFormat variant="muted">muted variant</HeadingFormat>
	</div>

	<div>
		<h2 class="text-2xl">Disabled</h2>
		<HeadingFormat disabled>Disabled</HeadingFormat>
	</div>
</main>
