<script lang="ts">
	import EndpointCard from '$lib/components/EndpointCard.svelte';
	import Button from '$lib/components/Button.svelte';
	import { onMount, getContext } from 'svelte';
	import type ApiWrapper from '$lib/ApiWrapper';
	import type { HistoryService } from '$lib/types/ApiWrapper';
	import { splitHistoryByDate } from '$lib/utils/splitHistoryByDate';
	import { formatDateHistoryCards } from '$lib/utils/dates';
	import HistoryCardDetailsPanel from '$lib/components/HistoryCardDetailsPanel.svelte';
	import LoadingSvg from '$lib/components/LoadingSVG.svelte';

	let api: ApiWrapper = getContext('api');

	let historyEndpoints: HistoryService[] = [];

	let historyToday: HistoryService[] = [];
	let historyYesterday: HistoryService[] = [];
	let historyWeek: HistoryService[] = [];

	let showDetailsPanel = false;
	let selectedHistoryId: number | null = null;

	let loading = true;

	function handleCardClick(id: number) {
		selectedHistoryId = id;
		showDetailsPanel = true;
	}

	function closeDetailsPanel() {
		showDetailsPanel = false;
		selectedHistoryId = null;
	}

	onMount(async () => {
		loading = true;
		historyEndpoints = await api.getHistoryUser(5);
		const splitHistory = splitHistoryByDate(historyEndpoints);
		historyToday = splitHistory.today;
		historyYesterday = splitHistory.yesterday;
		historyWeek = splitHistory.week;
		loading = false;
	});
</script>

<div class="align-items justify-center">
	<main class="flex-1 bg-white p-8">
		<div class="mb-6 flex items-center justify-between">
			<div>
				<h1 class="text-2xl font-bold">History</h1>
			</div>
		</div>
		{#if loading}
			<div class="flex h-96 items-center justify-center">
				<LoadingSvg />
			</div>
		{:else}
			<p class="text-bold my-4">Today</p>
			<div id="today" class="grid grid-cols-4 gap-12">
				{#each historyToday as card (card.historyId)}
					<EndpointCard
						id={card.historyId}
						title={card.endpointName}
						description={card.endpointDescription}
						useDate={formatDateHistoryCards(card.createdAt)}
						historyCard={true}
						onClick={() => handleCardClick(card.historyId)}
					/>
				{/each}
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
						onClick={() => handleCardClick(card.historyId)}
					/>
				{/each}
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
						onClick={() => handleCardClick(card.historyId)}
					/>
				{/each}
			</div>
		{/if}

		{#if showDetailsPanel && selectedHistoryId !== null}
			<div
				class="pointer-events-none fixed inset-y-0 right-0 z-50 flex h-full w-full max-w-2xl justify-end"
			>
				<div
					class="animate-slide-in pointer-events-auto relative flex h-full w-full max-w-2xl flex-col rounded-l-2xl bg-white shadow-2xl"
				>
					<Button
						class="absolute top-4 right-4 z-10 cursor-pointer text-2xl"
						onclick={closeDetailsPanel}
						iconOnly={true}
						size="md"
						variant="text"
						aria-label="Cerrar panel">×</Button
					>
					<HistoryCardDetailsPanel historyId={selectedHistoryId} />
				</div>
			</div>
		{/if}
	</main>
</div>
