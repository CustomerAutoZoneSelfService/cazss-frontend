<script lang="ts">
	import EndpointCard from '$lib/components/EndpointCard.svelte';
	import SearchBar from '$lib/components/SearchBar.svelte';
	import { onMount } from 'svelte';
	import { getContext } from 'svelte';
	import type ApiWrapper from '$lib/ApiWrapper'; //Exclusively for syntax.
	import type { Service } from '$lib/types/ApiWrapper';

	let api: ApiWrapper = getContext('api');

	let endpoints: Service[] = [];
	let filteredEndpoints: Service[] = [];

	onMount(async () => {
		endpoints = await api.getAllServices();
		filteredEndpoints = [...endpoints];
	});

	function handleFilter(allData: string[]) {
		const filteredTitles = allData;
		filteredEndpoints = endpoints.filter((endpoint) => filteredTitles.includes(endpoint.name));
	}
</script>

<div class="flex h-full flex-col items-center gap-5">
	<div class="mt-10 mb-5 w-6/10">
		<SearchBar {handleFilter} allData={endpoints.map((e) => e.name)} />
	</div>
	<div class="flex w-full flex-col justify-center">
		<h1 class="py-5 text-lg font-bold text-gray-500">Endpoints</h1>
		<main class="grid grid-cols-4 gap-12">
			{#if filteredEndpoints.length === 0}
				<p class="col-span-4 text-gray-500">No endpoints found</p>
			{:else}
				{#each filteredEndpoints as endpoint (endpoint.endpointId)}
					<EndpointCard
						id={endpoint.endpointId}
						title={endpoint.name}
						description={endpoint.description}
					/>
				{/each}
			{/if}
		</main>
	</div>
</div>
