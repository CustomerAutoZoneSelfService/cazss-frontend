<script lang="ts">
	import Button from '$lib/components/Button.svelte';
</script>

<main class="mx-auto my-8 max-w-2/3 space-y-4">
	<h1 class="text-3xl font-bold">Button component</h1>

	<div>
		<h2 class="text-2xl">Variant</h2>
		<Button>Default (primary) variant</Button>
		<Button variant="primary">primary variant</Button>
		<Button variant="secondary">secondary variant</Button>
		<Button variant="text">text variant</Button>
	</div>

	<div>
		<h2 class="text-2xl">Size</h2>
		<Button>Default (md) size</Button>
		<Button size="sm">sm size</Button>
		<Button size="md">md size</Button>
		<Button size="lg">lg size</Button>
	</div>

	<div>
		<h2 class="text-2xl">Disabled</h2>
		<Button disabled>disabled</Button>
	</div>

	<form action="" method="POST">
		<h2 class="text-2xl">Type</h2>
		<input class="mb-2 block border-1 border-black p-2" value="Hello, World!" />
		<Button>default (button) type</Button>
		<Button type="button">button type</Button>
		<Button type="submit">submit type</Button>
		<Button type="reset">reset type</Button>
	</form>
</main>
