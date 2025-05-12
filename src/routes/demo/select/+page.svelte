<script lang="ts">
	import Select from '$lib/components/Select.svelte';

	const options = [
		{
			value: '1',
			label: 'First'
		},
		{
			value: '2',
			label: 'Second'
		},
		{
			value: '3',
			label: 'Third'
		}
	];
</script>

<main class="mx-auto my-8 max-w-2/3 space-y-4">
	<h1 class="text-3xl font-bold">Select component</h1>

	<div>
		<h2 class="text-2xl">options</h2>
		<Select {options}></Select>
	</div>

	<div>
		<h2 class="text-2xl">selected</h2>
		<Select {options} selected="2"></Select>
	</div>

	<div>
		<h2 class="text-2xl">disabled</h2>
		<Select {options} disabled></Select>
	</div>
</main>
