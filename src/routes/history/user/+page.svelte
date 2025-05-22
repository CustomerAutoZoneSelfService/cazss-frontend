<script lang="ts">
	import EndpointCard from '$lib/components/EndpointCard.svelte';
	import Button from '$lib/components/Button.svelte';
	import { onMount, getContext } from 'svelte';
	import { goto } from '$app/navigation';
	import type ApiWrapper from '$lib/ApiWrapper'; //Exclusively for syntax.
	import type { HistoryService } from '$lib/types/ApiWrapper';
	import { splitHistoryByDate } from '$lib/utils/splitHistoryByDate';
	import { formatDateHistoryCards } from '$lib/utils/dates';

	// Mock data for the endpoint cards
	/**
   * Use this if the API is not available
	const mockEndpointCards = Array.from({ length: 12 }, (_, i) => {
		const dayOffset = Math.floor(i / 3); // Cada 3 elementos cambia de día
		const date = new Date();
		date.setDate(date.getDate() - dayOffset); // Resta días por grupo

		// Para diferenciarlos un poco, agrega unos segundos
		date.setSeconds(date.getSeconds() + (i % 3) * 10);

		return {
			historyId: i + 2,
			endpoint: {
				endpointId: 3,
				name: 'Get TEST',
				description:
					'Dscripcion de un endpount para obtener un recurso y asi poder ver el resultado'
			},
			createdAt: date.toLocaleString('es-MX', {
				day: '2-digit',
				month: 'short',
				hour: '2-digit',
				minute: '2-digit',
				hour12: false
			})
		};
	});

  */

	// APi Wrapper
	let api: ApiWrapper = getContext('api');

	let historyEndpoints: HistoryService[] = [];

	let historyToday: HistoryService[] = [];
	let historyYesterday: HistoryService[] = [];
	let historyWeek: HistoryService[] = [];

	onMount(async () => {
		// TODO: Obtain the user Id from the session or context
		const userId = 1; // TODO: Replace with session user ID
		historyEndpoints = await api.getHistoryUser(userId);
		const splitHistory = splitHistoryByDate(historyEndpoints);
		historyToday = splitHistory.today;
		historyYesterday = splitHistory.yesterday;
		historyWeek = splitHistory.week;

		console.log(historyEndpoints);
	});

	// TODO: Make empty state for the history page sections
	// TODO: Handle correctly the unique key for the cards
</script>

<div class="align-items justify-center">
	<main class="flex-1 bg-white p-8">
		<div class="mb-6 flex items-center justify-between">
			<div>
				<h1 class="text-2xl font-bold">History</h1>
			</div>
		</div>
		<p class="text-bold my-4">Today</p>
		<div id="today" class="grid grid-cols-4 gap-12">
			{#each historyToday as card (card.historyId)}
				<EndpointCard
					id={card.historyId}
					title={card.endpointName}
					description={card.endpointDescription}
					useDate={formatDateHistoryCards(card.createdAt)}
					historyCard={true}
				/>
			{/each}
			<div class="col-span-4 flex items-center justify-end">
				<Button variant="text" size="md" onclick={() => goto('/history/today')}>See more</Button>
			</div>
		</div>
		<p class="text-bold my-4">Yesterday</p>
		<div id="yesterday" class="grid grid-cols-4 gap-12">
			{#each historyYesterday as card (card.historyId)}
				<EndpointCard
					id={card.historyId}
					title={card.endpointName}
					description={card.endpointDescription}
					useDate={formatDateHistoryCards(card.createdAt)}
					historyCard={true}
				/>
			{/each}
			<div class="col-span-4 flex items-center justify-end">
				<Button variant="text" size="md" onclick={() => goto('/history/yesterday')}>
					See more
				</Button>
			</div>
		</div>
		<p class="text-bold my-4">Last 7 days</p>
		<div id="week" class="grid grid-cols-4 gap-12">
			{#each historyWeek as card (card.historyId)}
				<EndpointCard
					id={card.historyId}
					title={card.endpointName}
					description={card.endpointDescription}
					useDate={formatDateHistoryCards(card.createdAt)}
					historyCard={true}
				/>
			{/each}
			<div class="col-span-4 flex items-center justify-end">
				<Button variant="text" size="md" onclick={() => goto('/history/week')}>See more</Button>
			</div>
		</div>
	</main>
</div>
