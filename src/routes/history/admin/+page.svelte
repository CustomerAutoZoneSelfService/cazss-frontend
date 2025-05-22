<script lang="ts">
	import EndpointCard from '$lib/components/EndpointCard.svelte';
	import Button from '$lib/components/Button.svelte';
	import HistoryCardDetailsPanel from '$lib/components/HistoryCardDetailsPanel.svelte';
	import { onMount, getContext } from 'svelte';
	import type ApiWrapper from '$lib/ApiWrapper';
	import type { HistoryService } from '$lib/types/ApiWrapper';
	import { splitHistoryByDate } from '$lib/utils/splitHistoryByDate';
	import LoadingSVG from '$lib/components/LoadingSVG.svelte';

	let api: ApiWrapper = getContext('api');

	let historyEndpoints: HistoryService[] = [];
	let todayEndpoints: HistoryService[] = [];
	let yesterdayEndpoints: HistoryService[] = [];
	let weekEndpoints: HistoryService[] = [];
	let loading = true;

	onMount(async () => {
		loading = true;
		historyEndpoints = await api.getHistoryAdmin();
		const { today, yesterday, week } = splitHistoryByDate(historyEndpoints);
		todayEndpoints = today;
		yesterdayEndpoints = yesterday;
		weekEndpoints = week;
		loading = false;
	});

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

	let showDetailsPanel = false;
	let selectedHistoryId: number | null = null;

	function handleCardClick(id: number) {
		selectedHistoryId = id;
		showDetailsPanel = true;
	}

	function closeDetailsPanel() {
		showDetailsPanel = false;
		selectedHistoryId = null;
	}

	let panelRef: HTMLDivElement | null = null;

	function handleClickOutside(event: MouseEvent) {
		if (showDetailsPanel && panelRef && !panelRef.contains(event.target as Node)) {
			closeDetailsPanel();
		}
	}

	onMount(() => {
		document.addEventListener('mousedown', handleClickOutside);
		return () => {
			document.removeEventListener('mousedown', handleClickOutside);
		};
	});
</script>

<div class="align-items relative justify-center">
	<main class="flex-1 bg-white p-8">
		<div class="mb-6 flex items-center justify-between">
			<div>
				<h1 class="text-2xl font-bold">History</h1>
			</div>
		</div>

		{#if loading}
			<div class="flex h-96 items-center justify-center">
				<LoadingSVG />
			</div>
		{:else}
			<p class="text-bold my-4">Today</p>
			<div id="today" class="grid grid-cols-4 gap-12">
				{#each todayEndpoints as card (card.historyId)}
					<EndpointCard
						id={card.historyId}
						title={card.endpointName}
						description={card.endpointDescription}
						useDate={formatDate(card.createdAt)}
						historyCard={true}
						onClick={() => handleCardClick(card.historyId)}
					/>
				{/each}
			</div>
			<p class="text-bold my-4">Yesterday</p>
			<div id="yesterday" class="grid grid-cols-4 gap-12">
				{#each yesterdayEndpoints as card (card.historyId)}
					<EndpointCard
						id={card.historyId}
						title={card.endpointName}
						description={card.endpointDescription}
						useDate={formatDate(card.createdAt)}
						historyCard={true}
						onClick={() => handleCardClick(card.historyId)}
					/>
				{/each}
			</div>
			<p class="text-bold my-4">Last 7 days</p>
			<div id="week" class="grid grid-cols-4 gap-12">
				{#each weekEndpoints as card (card.historyId)}
					<EndpointCard
						id={card.historyId}
						title={card.endpointName}
						description={card.endpointDescription}
						useDate={formatDate(card.createdAt)}
						historyCard={true}
						onClick={() => handleCardClick(card.historyId)}
					/>
				{/each}
			</div>
		{/if}
	</main>

	{#if showDetailsPanel && selectedHistoryId !== null}
		<div
			class="pointer-events-none fixed inset-y-0 right-0 z-50 flex h-full w-full max-w-2xl justify-end"
		>
			<div
				bind:this={panelRef}
				class="animate-slide-in pointer-events-auto relative flex h-full w-full max-w-2xl flex-col rounded-l-2xl bg-white shadow-2xl"
			>
				<Button
					class="absolute top-4 right-4 z-10 cursor-pointer text-2xl"
					onclick={closeDetailsPanel}
					iconOnly={true}
					size="lg"
					variant="text"
					aria-label="Cerrar panel">×</Button
				>
				<HistoryCardDetailsPanel historyId={selectedHistoryId} />
			</div>
		</div>
	{/if}
</div>
