<script lang="ts">
	import EndpointCard from '$lib/components/EndpointCard.svelte';
	import Button from '$lib/components/Button.svelte';
	import HistoryCardDetailsPanel from '$lib/components/HistoryCardDetailsPanel.svelte';
	import { onMount, getContext } from 'svelte';
	import { goto } from '$app/navigation';
	import type ApiWrapper from '$lib/ApiWrapper';
	import type { HistoryService } from '$lib/types/ApiWrapper';
	import { page } from '$app/stores';
	import { splitHistoryByDate } from '$lib/utils/splitHistoryByDate';

	let api: ApiWrapper = getContext('api');

	let todayCards: HistoryService[] = [];
	let yesterdayCards: HistoryService[] = [];
	let weekCards: HistoryService[] = [];

	onMount(async () => {
		const userId = $page.data.user?.userId;
		if (!userId) return;


		const allHistory = await api.getAllHistory();
		const now = new Date();
		const today = now.toDateString();

		const yesterdayDate = new Date();
		yesterdayDate.setDate(now.getDate() - 1);
		const yesterday = yesterdayDate.toDateString();

		todayCards = [];
		yesterdayCards = [];
		weekCards = [];

		for (const card of allHistory) {
			const cardDate = new Date(card.created);
			const cardDateStr = cardDate.toDateString();

			if (cardDateStr === today) {
				todayCards.push(card);
			} else if (cardDateStr === yesterday) {
				yesterdayCards.push(card);
			} else {
				const daysAgo = (now.getTime() - cardDate.getTime()) / (1000 * 60 * 60 * 24);
				if (daysAgo <= 7) {
					weekCards.push(card);
				}
			}
		}
	});

	function formatDate(datetime: string | number | Date) {
		const date = new Date(datetime);
		return date.toLocaleString('es-MX', {
			day: '2-digit',
			month: '2-digit',
			hour: '2-digit',
			minute: '2-digit',
			hour12: false
		});
	}

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
			{#each todayCards as card (card.historyId)}
				<EndpointCard
					id={card.historyId}
					title={card.name}
					description={card.description}
					useDate={formatDate(card.created)}
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

			{#each yesterdayCards as card (card.historyId)}
				<EndpointCard
					id={card.historyId}
					title={card.name}
					description={card.description}
					useDate={formatDate(card.created)}
					historyCard={true}
					onClick={() => handleCardClick(card)}
				/>
			{/each}
			<div class="col-span-4 flex items-center justify-end">

				<Button variant="text" size="md" onclick={() => goto('/history/yesterday')}>See more</Button
				>

			</div>
		</div>

		<p class="text-bold my-4">Last 7 days</p>
		<div id="week" class="grid grid-cols-4 gap-12">

			{#each weekCards as card (card.historyId)}
				<EndpointCard
					id={card.historyId}
					title={card.name}
					description={card.description}
					useDate={formatDate(card.created)}
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
				inputs={[{ label: 'Email', value: selectedCard.email || 'N/A' }]}
				output={[{ label: 'Date', value: formatDate(selectedCard.createdAt) || 'N/A' }]}
				onCallAgain={() => {}}
			/>
		</div>
	{/if}
</div>
