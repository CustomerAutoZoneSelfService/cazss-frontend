<script lang="ts">
	import EndpointCard from '$lib/components/EndpointCard.svelte';
	import SearchBar from '$lib/components/SearchBar.svelte';
	import { onMount } from 'svelte';
	import { getContext } from 'svelte';
	import type ApiWrapper from '$lib/ApiWrapper'; //Exclusively for syntax.
	import { type CategoryWithServices, type Service } from '$lib/types/ApiWrapper';
	import { goto } from '$app/navigation';
	import Spinner from '$lib/components/Spinner.svelte';

	let api: ApiWrapper = getContext('api');

	let endpoints: CategoryWithServices[] = [];
	let filteredEndpoints: CategoryWithServices[] = [];
	let selectedEndpoint: Service | null = null;
	let prefilledInputs: Array<{ label: string; value: string }> = [];

	onMount(async () => {
		endpoints = await api.getAllServices();
		console.log(endpoints);
		filteredEndpoints = [...endpoints];

		// Check for pre-filled data from history
		const prefilledData = sessionStorage.getItem('prefilledEndpointData');
		if (prefilledData) {
			const data = JSON.parse(prefilledData);
			// Find the endpoint that matches the name from history

			endpoints.forEach((c) => {
				selectedEndpoint = c.services.find((ep: Service) => ep.name === data.endpointName) || null;
			});

			prefilledInputs = data.inputs || [];
			// Clear the stored data after using it
			sessionStorage.removeItem('prefilledEndpointData');

			// If we found the endpoint, navigate to its details
			if (selectedEndpoint) {
				goto(
					`/endpoint/${selectedEndpoint.endpointId}?prefilled=${JSON.stringify(prefilledInputs)}`
				);
			}
		}
	});

	function handleFilter(allData: string[]) {
		console.log(endpoints)
		const normalizedSearchStrings = allData.map((str) => str.toLowerCase().trim());
		let tempCategories = [];

		console.log(allData)

		const matchesAnySearchString = (text: string): boolean => {
			const normalizedText = text.toLowerCase();
			return normalizedSearchStrings.some((searchStr) => normalizedText.includes(searchStr));
		};

		for (const category of filteredEndpoints) {
			const categoryMatches = matchesAnySearchString(category.name);

			const matchingEndpoints = category.services.filter(
				(endpoint: Service) =>
					matchesAnySearchString(endpoint.name) || matchesAnySearchString(endpoint.description)
			);

			if (categoryMatches || matchingEndpoints.length > 0) {
				tempCategories.push({
					...category,
					endpoints: matchingEndpoints
				});
			}
		}

		filteredEndpoints = tempCategories;
	}

	function handleEndpointClick(endpoint: Service) {
		goto(`/endpoint/${endpoint.endpointId}`);
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
				<Spinner size="w-12 h-12" color="border-[#af1624]" variant="dots" />
			{:else}
				<div class="flex w-full flex-col">
					{#each endpoints as category (category.categoryId)}
						<div class="flex w-full flex-col">
							<h1
								style="color: {category.color};"
							>
								{category.name}
							</h1>
							<div class="flex h-full w-full justify-around">
								{#each category.services as endpoint (endpoint.endpointId)}
									<EndpointCard
										id={endpoint.endpointId}
										title={endpoint.name}
										description={endpoint.description}
										onClick={() => handleEndpointClick(endpoint)}
									></EndpointCard>
								{/each}
							</div>
						</div>
					{/each}
				</div>
			{/if}
		</main>
	</div>
</div>
