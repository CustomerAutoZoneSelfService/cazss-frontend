<script lang="ts">
	import List from '$lib/components/List.svelte';
</script>

<main class="mx-auto my-8 max-w-2/3 space-y-4">
	<h1 class="text-3xl font-bold">List component</h1>

	<div>
		<h2 class="text-2xl">Direction</h2>

		<h3 class="text-xl">vertical (default) direction</h3>
		<List direction="vertical">
			<li>First</li>
			<li>Second</li>
			<li>Third</li>
		</List>

		<h3 class="text-xl">horizontal direction</h3>
		<List direction="horizontal">
			<li>First</li>
			<li>Second</li>
			<li>Third</li>
		</List>
	</div>

	<div>
		<h2 class="text-2xl">Type</h2>

		<h3 class="text-xl">ul (default) type</h3>
		<List type="ul">
			<li>First</li>
			<li>Second</li>
			<li>Third</li>
		</List>

		<h3 class="text-xl">ol type</h3>
		<List type="ol">
			<li>First</li>
			<li>Second</li>
			<li>Third</li>
		</List>
	</div>

	<div>
		<h2 class="text-2xl">List</h2>

		<h3 class="text-xl">true (default) list</h3>
		<List list>
			<li>First</li>
			<li>Second</li>
			<li>Third</li>
		</List>

		<h3 class="text-xl">false list</h3>
		<List list={false}>
			<li>First</li>
			<li>Second</li>
			<li>Third</li>
		</List>
	</div>
</main>
