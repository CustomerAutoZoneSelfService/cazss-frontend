<script lang="ts">
	import EndpointCard from '$lib/components/EndpointCard.svelte';
	import Button from '$lib/components/Button.svelte';
	import RightPanel from '$lib/components/RightPanel.svelte';
	import { onMount, getContext } from 'svelte';
	import { goto } from '$app/navigation';
	import type ApiWrapper from '$lib/ApiWrapper'; //Exclusively for syntax.
	import type { HistoryService } from '$lib/types/ApiWrapper';

	type CardType = {
		historyId: number;
		email: string;
		endpointName: string;
		endpointDescription: string;
		createdAt: string;
	};

	// Mock data for the endpoint cards
	const mockEndpointCards: CardType[] = Array.from({ length: 12 }, (_, i) => {
		const dayOffset = Math.floor(i / 3); // Cada 3 elementos cambia de día
		const date = new Date();
		date.setDate(date.getDate() - dayOffset); // Resta días por grupo

		// Para diferenciarlos un poco, agrega unos segundos
		date.setSeconds(date.getSeconds() + (i % 3) * 10);

		return {
			historyId: i + 2,
			email: `user${i + 1}@example.com`,
			endpointName: 'Get TEST',
			endpointDescription:
				'Descripción de un endpoint para obtener un recurso y así poder ver el resultado',
			createdAt: date.toLocaleString('es-MX', {
				day: '2-digit',
				month: 'short',
				hour: '2-digit',
				minute: '2-digit',
				hour12: false
			})
		};
	});

	// APi Wrapper
	let api: ApiWrapper = getContext('api');

	let historyEndpoints: CardType[] = [];

	onMount(async () => {
		historyEndpoints = await api.getHistoryAdmin();
	});

	// Function to format the date
	// TODO: Move this to a utils file
	function formatDate(datetime: string) {
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
	let selectedCard: CardType | null = null;
	let showPanel = false;

	function handleCardClick(card: CardType) {
		selectedCard = card;
		showPanel = true;
	}

	function closePanel() {
		showPanel = false;
		selectedCard = null;
	}

	// TODO: Make empty state for the history page sections
	// TODO: Handle correctly the unique key for the cards
</script>

<div class="align-items justify-center relative">
	<main class="flex-1 bg-white p-8">
		<div class="mb-6 flex items-center justify-between">
			<div>
				<h1 class="text-2xl font-bold">History</h1>
			</div>
		</div>
		<p class="text-bold my-4">Today</p>
		<div id="today" class="grid grid-cols-4 gap-12">
			{#each historyEndpoints as card (card.historyId)}
				<EndpointCard
					id={card.historyId}
					title={card.endpointName}
					description={card.endpointDescription}
					useDate={formatDate(card.createdAt)}
					historyCard={true}
					on:click={() => handleCardClick(card)}
				/>
			{/each}
			<div class="col-span-4 flex items-center justify-end">
				<Button variant="text" size="md" onclick={() => goto('/history/today')}>See more</Button>
			</div>
		</div>
		<p class="text-bold my-4">Yesterday</p>
		<div id="yesterday" class="grid grid-cols-4 gap-12">
			{#each mockEndpointCards as card (card.historyId)}
				<EndpointCard
					id={card.historyId}
					title={card.endpointName}
					description={card.endpointDescription}
					useDate={card.createdAt}
					historyCard={true}
					on:click={() => handleCardClick(card)}
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
			{#each mockEndpointCards as card (card.historyId)}
				<EndpointCard
					id={card.historyId}
					title={card.endpointName}
					description={card.endpointDescription}
					useDate={card.createdAt}
					historyCard={true}
					on:click={() => handleCardClick(card)}
				/>
			{/each}
			<div class="col-span-4 flex items-center justify-end">
				<Button variant="text" size="md" onclick={() => goto('/history/week')}>See more</Button>
			</div>
		</div>
	</main>

	{#if showPanel && selectedCard}
		<!-- RightPanel as a side panel, no overlay -->
		<div class="fixed top-0 right-0 h-full w-[32rem] bg-white shadow-2xl z-50 flex flex-col">
			<Button class="self-end m-4" variant="text" size="md" onClick={closePanel}>✕</Button>
			<RightPanel
				title={selectedCard.endpointName}
				titleHighlight={selectedCard.endpointName.split(' ').at(-1) || ''}
				description={selectedCard.endpointDescription}
				inputs={[{ label: 'Email', value: selectedCard.email || 'N/A' }]}
				output={[{ label: 'Date', value: selectedCard.createdAt || 'N/A' }]}
				onCallAgain={() => {}}
			/>
		</div>
	{/if}
</div>
