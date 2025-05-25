<script lang="ts">
	import EndpointCardAdmin from '$lib/components/EndpointCardAdmin.svelte';
	import HistoryCardDetailsPanel from '$lib/components/HistoryCardDetailsPanel.svelte';
	import LoadingSVG from '$lib/components/LoadingSVG.svelte';
	import { onMount, getContext } from 'svelte';
	import type ApiWrapper from '$lib/ApiWrapper';
	import { splitHistoryByDate } from '$lib/utils/dates';
	import type { HistoryService } from '$lib/types/ApiWrapper';
	import SidePanel from '$lib/components/RightSidePanel.svelte';
	//import { splitHistoryByDate } from '$lib/utils/splitHistoryByDate';

	let api: ApiWrapper = getContext('api');

	let todayHistoryCards: HistoryService[] = [];
	let yesterdayHistoryCards: HistoryService[] = [];
	let weekHistoryCards: HistoryService[] = [];
	let isLoading = true;

	onMount(async () => {
		isLoading = true;
		let allHistory = [];
		try {
			allHistory = await api.getAllHistory();
		} catch (error) {
			// TODO: Handle error
			// For now, just log it to the console
			console.error('Error loading history:', error);
			isLoading = false;
			return;
		}

		const splitHistory = splitHistoryByDate(allHistory);
		todayHistoryCards = splitHistory.today;
		yesterdayHistoryCards = splitHistory.yesterday;
		weekHistoryCards = splitHistory.week;
		isLoading = false;
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
	{#if isLoading}
		<div class="flex-1 bg-white p-8">
			<div class="mb-6 flex items-center justify-between">
				<h1 class="text-2xl font-bold">History</h1>
			</div>
		</div>
		<div class="flex h-[60vh] items-center justify-center">
			<LoadingSVG />
		</div>
	{:else}
		<main class="flex-1 bg-white p-8">
			<div class="mb-6 flex items-center justify-between">
				<h1 class="text-2xl font-bold">History</h1>
			</div>

			<!-- TODAY -->
			<p class="text-bold my-4">Today</p>
			<div id="today" class="flex flex-col gap-4">
				{#each todayHistoryCards as card (card.historyId)}
					<EndpointCardAdmin
						id={card.historyId}
						title={card.endpointName}
						useDate={formatDate(card.createdAt)}
						username={card.email?.split('@')[0] || 'Usuario'}
						userInitial={card.email?.charAt(0).toUpperCase() || 'U'}
						historyCard={true}
						onClick={() => handleCardClick(card)}
					/>
				{/each}
			</div>

			<!-- YESTERDAY -->
			<p class="text-bold my-4">Yesterday</p>
			<div id="yesterday" class="flex flex-col gap-4">
				{#each yesterdayHistoryCards as card (card.historyId)}
					<EndpointCardAdmin
						id={card.historyId}
						title={card.endpointName}
						useDate={formatDate(card.createdAt)}
						username={card.email?.split('@')[0] || 'Usuario'}
						userInitial={card.email?.charAt(0).toUpperCase() || 'U'}
						historyCard={true}
						onClick={() => handleCardClick(card)}
					/>
				{/each}
			</div>

			<!-- LAST 7 DAYS -->
			<p class="text-bold my-4">Last 7 days</p>
			<div id="week" class="flex flex-col gap-4">
				{#each weekHistoryCards as card (card.historyId)}
					<EndpointCardAdmin
						id={card.historyId}
						title={card.endpointName}
						useDate={formatDate(card.createdAt)}
						username={card.email?.split('@')[0] || 'Usuario'}
						userInitial={card.email?.charAt(0).toUpperCase() || 'U'}
						historyCard={true}
						onClick={() => handleCardClick(card)}
					/>
				{/each}
			</div>
		</main>
	{/if}

	{#if showPanel && selectedCard}
		<SidePanel visible={showPanel} onClose={closePanel}>
			<HistoryCardDetailsPanel historyId={selectedCard?.historyId} />
		</SidePanel>
	{/if}
</div>
