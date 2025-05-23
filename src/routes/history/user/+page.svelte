<script lang="ts">
	import EndpointCard from '$lib/components/EndpointCard.svelte';
	import Button from '$lib/components/Button.svelte';
	import { onMount, getContext } from 'svelte';
	import { goto } from '$app/navigation';
	import type ApiWrapper from '$lib/ApiWrapper'; //Exclusively for syntax.
	import type { HistoryService } from '$lib/types/ApiWrapper';
	import { splitHistoryByDate } from '$lib/utils/splitHistoryByDate';
	import { formatDateHistoryCards } from '$lib/utils/dates';
	import HistoryCardDetailsPanel from '$lib/components/HistoryCardDetailsPanel.svelte';

	// APi Wrapper
	let api: ApiWrapper = getContext('api');

	let historyEndpoints: HistoryService[] = [];
	let historyToday: HistoryService[] = [];
	let historyYesterday: HistoryService[] = [];
	let historyWeek: HistoryService[] = [];

	// State for selected card and panel visibility
	let selectedCard: HistoryService | null = null;
	let showPanel = false;

	function handleCardClick(card: HistoryService) {
		selectedCard = card;
		showPanel = true;
	}

	function closePanel() {
		showPanel = false;
		selectedCard = null;
	}

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

<div class="align-items relative justify-center">
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
					onClick={() => handleCardClick(card)}
				/>
			{/each}
			<div class="col-span-4 flex items-center justify-end">
				<Button variant="text" size="md" onClick={() => goto('/history/today')}>See more</Button>
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
					onClick={() => handleCardClick(card)}
				/>
			{/each}
			<div class="col-span-4 flex items-center justify-end">
				<Button variant="text" size="md" onClick={() => goto('/history/yesterday')}>
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
					onClick={() => handleCardClick(card)}
				/>
			{/each}
			<div class="col-span-4 flex items-center justify-end">
				<Button variant="text" size="md" onClick={() => goto('/history/week')}>See more</Button>
			</div>
		</div>
	</main>

	{#if showPanel && selectedCard}
		<!-- HistoryCardDetailsPanel as a side panel, no overlay -->
		<div class="fixed top-0 right-0 z-50 flex h-full w-[32rem] flex-col bg-white shadow-2xl">
			<Button class="m-4 self-end" variant="text" size="md" onClick={closePanel}>✕</Button>
			<HistoryCardDetailsPanel
				title={selectedCard.endpointName}
				titleHighlight={selectedCard.endpointName.split(' ').at(-1) || ''}
				description={selectedCard.endpointDescription}
				inputs={selectedCard.inputs?.map((input) => ({ label: input.name, value: input.value })) ||
					[]}
				output={[{ label: 'Response', value: JSON.stringify(selectedCard.output, null, 2) }]}
				historyData={selectedCard}
			/>
		</div>
	{/if}
</div>
