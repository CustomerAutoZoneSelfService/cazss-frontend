<script lang="ts">
	import EndpointCard from '$lib/components/EndpointCard.svelte';
	import Button from '$lib/components/Button.svelte';
	import { onMount, getContext } from 'svelte';
	import type ApiWrapper from '$lib/ApiWrapper';
	import type { HistoryService } from '$lib/types/ApiWrapper';
	import { splitHistoryByDate } from '$lib/utils/splitHistoryByDate';
	import { formatDateHistoryCards } from '$lib/utils/dates';
	import HistoryCardDetailsPanel from '$lib/components/HistoryCardDetailsPanel.svelte';

	let api: ApiWrapper = getContext('api');

	let historyEndpoints: HistoryService[] = [];
	let historyToday: HistoryService[] = [];
	let historyYesterday: HistoryService[] = [];
	let historyWeek: HistoryService[] = [];

	let selectedCard: HistoryService | null = null;
	let showPanel = false;

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
		async function cargarHistorial() {
			historyEndpoints = await api.getHistoryUser(5);
			const splitHistory = splitHistoryByDate(historyEndpoints);
			historyToday = splitHistory.today;
			historyYesterday = splitHistory.yesterday;
			historyWeek = splitHistory.week;
		}

		cargarHistorial();

		const handleOutsideClick = (event: MouseEvent) => {
			const panel = document.querySelector('.history-details-panel');
			const isClickInsidePanel = panel?.contains(event.target as Node);
			const isClickOnCard = (event.target as HTMLElement).closest('.endpoint-card');

			if (!isClickInsidePanel && !isClickOnCard) {
				closePanel();
			}
		};

		document.addEventListener('click', handleOutsideClick);

		return () => {
			document.removeEventListener('click', handleOutsideClick);
		};
	});
</script>

<style>
	/* Necesitamos esta clase para que querySelector funcione para el panel */
	.history-details-panel {
		width: 32rem;
		position: fixed;
		top: 0;
		right: 0;
		height: 100%;
		background: white;
		box-shadow: 0 0 10px rgba(0,0,0,0.3);
		z-index: 50;
		display: flex;
		flex-direction: column;
	}
</style>

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
				<!-- Aquí uso un botón accesible -->
				<button
					class="endpoint-card"
					type="button"
					on:click={() => handleCardClick(card)}
					on:keydown={(e) => {
						if (e.key === 'Enter' || e.key === ' ') {
							e.preventDefault();
							handleCardClick(card);
						}
					}}
					aria-pressed={selectedCard?.historyId === card.historyId}
					style="all:unset; cursor:pointer; display: block;"
				>
					<EndpointCard
						id={card.historyId}
						title={card.endpointName}
						description={card.endpointDescription}
						useDate={formatDateHistoryCards(card.createdAt)}
						historyCard={true}
					/>
				</button>
			{/each}
		</div>

		<p class="text-bold my-4">Yesterday</p>
		<div id="yesterday" class="grid grid-cols-4 gap-12">
			{#each historyYesterday as card (card.historyId)}
				<button
					class="endpoint-card"
					type="button"
					on:click={() => handleCardClick(card)}
					on:keydown={(e) => {
						if (e.key === 'Enter' || e.key === ' ') {
							e.preventDefault();
							handleCardClick(card);
						}
					}}
					aria-pressed={selectedCard?.historyId === card.historyId}
					style="all:unset; cursor:pointer; display: block;"
				>
					<EndpointCard
						id={card.historyId}
						title={card.endpointName}
						description={card.endpointDescription}
						useDate={formatDateHistoryCards(card.createdAt)}
						historyCard={true}
					/>
				</button>
			{/each}
		</div>

		<p class="text-bold my-4">Last 7 days</p>
		<div id="week" class="grid grid-cols-4 gap-12">
			{#each historyWeek as card (card.historyId)}
				<button
					class="endpoint-card"
					type="button"
					on:click={() => handleCardClick(card)}
					on:keydown={(e) => {
						if (e.key === 'Enter' || e.key === ' ') {
							e.preventDefault();
							handleCardClick(card);
						}
					}}
					aria-pressed={selectedCard?.historyId === card.historyId}
					style="all:unset; cursor:pointer; display: block;"
				>
					<EndpointCard
						id={card.historyId}
						title={card.endpointName}
						description={card.endpointDescription}
						useDate={formatDateHistoryCards(card.createdAt)}
						historyCard={true}
					/>
				</button>
			{/each}
		</div>
	</main>

	{#if showPanel && selectedCard}
		<div class="history-details-panel">
			<Button class="m-4 self-end" variant="text" size="md" on:click={closePanel}>✕</Button>
			<HistoryCardDetailsPanel
				title={selectedCard.endpointName}
				titleHighlight={selectedCard.endpointName.split(' ').at(-1) || ''}
				description={selectedCard.endpointDescription}
				inputs={selectedCard.inputs?.map((input) => ({ label: input.name, value: input.value })) || []}
				output={[{ label: 'Response', value: JSON.stringify(selectedCard.output, null, 2) }]}
				historyData={selectedCard}
			/>
		</div>
	{/if}
</div>
