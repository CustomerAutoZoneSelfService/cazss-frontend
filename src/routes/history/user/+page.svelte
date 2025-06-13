<script lang="ts">
	import EndpointCard from '$lib/components/EndpointCard.svelte';
	import { onMount, getContext } from 'svelte';
	import SidePanel from '$lib/components/RightSidePanel.svelte';
	import type ApiWrapper from '$lib/ApiWrapper';
	import type { HistoryService } from '$lib/types/ApiWrapper';
	import { splitHistoryByDate } from '$lib/utils/dates';
	import { formatDateHistoryCards } from '$lib/utils/dates';
	import HistoryCardDetailsPanel from '$lib/components/HistoryCardDetailsPanel.svelte';
	import LoadingSVG from '$lib/components/LoadingSVG.svelte';
	import { user } from '$lib/stores/user';
	import { get } from 'svelte/store';

	let api: ApiWrapper = getContext('api');

	let historyEndpoints: HistoryService[] = [];
	let todayHistoryCards: HistoryService[] = [];
	let yesterdayHistoryCards: HistoryService[] = [];
	let weekHistoryCards: HistoryService[] = [];

	let selectedCard: HistoryService | null = null;
	let showPanel = false;
	let isLoading = true;

	function handleCardClick(card: HistoryService) {
		if (selectedCard?.historyId === card.historyId) {
			closePanel();
		} else {
			selectedCard = card;
			showPanel = true;
		}
	}

	function closePanel() {
		showPanel = false;
		selectedCard = null;
	}

	onMount(() => {
		async function loadHistory() {
			isLoading = true;
			try {
				const currentUser = get(user);
				if (!currentUser) {
					return;
				}

				const userId = parseInt(currentUser.user_id);
				historyEndpoints = await api.getHistoryUser(userId);
				const splitHistory = splitHistoryByDate(historyEndpoints);
				todayHistoryCards = splitHistory.today;
				yesterdayHistoryCards = splitHistory.yesterday;
				weekHistoryCards = splitHistory.week;
			} catch (error) {
				// TODO: Handle error
				console.error('Error loading user history:', error);
			} finally {
				isLoading = false;
			}
		}

		loadHistory();
	});
</script>

<div class="align-items relative justify-center">
	{#if isLoading}
		<div class="flex-1 bg-white p-8">
			<div class="mb-6 flex items-center justify-between">
				<div>
					<h1 class="text-2xl font-bold">History</h1>
				</div>
			</div>

			<div class="flex h-[60vh] items-center justify-center">
				<LoadingSVG />
			</div>
		</div>
	{:else}
		<main class="flex-1 bg-white p-8">
			<div class="mb-6 flex items-center justify-between">
				<div>
					<h1 class="text-2xl font-bold">History</h1>
				</div>
			</div>

			<p class="text-bold my-4">Today</p>
			<div id="today" class="grid grid-cols-4 gap-12">
				{#each todayHistoryCards as card (card.historyId)}
					<EndpointCard
						id={card.historyId}
						title={card.endpointName}
						description={card.endpointDescription}
						useDate={formatDateHistoryCards(card.createdAt)}
						historyCard={true}
						onClick={() => handleCardClick(card)}
					/>
				{/each}
			</div>

			<p class="text-bold my-4">Yesterday</p>
			<div id="yesterday" class="grid grid-cols-4 gap-12">
				{#each yesterdayHistoryCards as card (card.historyId)}
					<EndpointCard
						id={card.historyId}
						title={card.endpointName}
						description={card.endpointDescription}
						useDate={formatDateHistoryCards(card.createdAt)}
						historyCard={true}
						onClick={() => handleCardClick(card)}
					/>
				{/each}
			</div>

			<p class="text-bold my-4">Last 7 days</p>
			<div id="week" class="grid grid-cols-4 gap-12">
				{#each weekHistoryCards as card (card.historyId)}
					<EndpointCard
						id={card.historyId}
						title={card.endpointName}
						description={card.endpointDescription}
						useDate={formatDateHistoryCards(card.createdAt)}
						historyCard={true}
						onClick={() => handleCardClick(card)}
					/>
				{/each}
			</div>
		</main>
	{/if}

	{#if showPanel && selectedCard}
		<SidePanel visible={showPanel} onClose={closePanel}>
			<HistoryCardDetailsPanel historyId={selectedCard.historyId} />
		</SidePanel>
	{/if}
</div>
