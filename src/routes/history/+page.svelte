<script lang="ts">
	import EndpointCard from '$lib/components/EndpointCard.svelte';
	import Button from '$lib/components/Button.svelte';
	import { goto } from '$app/navigation';
	import ApiWrapper from '$lib/ApiWrapper';
	import type { HistoryService } from '$lib/types/ApiWrapper';


	import { onMount } from 'svelte';
	import { page } from '$app/stores';

	let todayCards: HistoryService[] = [];
	let yesterdayCards: HistoryService[] = [];
	let weekCards: HistoryService[] = [];


	onMount(async () => {
		const userId = $page.data.user?.userId; 
		if (!userId) return;

		const api = new ApiWrapper();
		api.getHistoryUser(userId);


		const history: HistoryService[] = await ApiWrapper.getHistoryUser(userId);

		const today = new Date();
		const yesterday = new Date();
		yesterday.setDate(today.getDate() - 1);

		todayCards = history.filter((h) => sameDay(new Date(h.createdAt), today));
		yesterdayCards = history.filter((h) => sameDay(new Date(h.createdAt), yesterday));
		weekCards = history.filter((h) => {
			const d = new Date(h.createdAt);
			const diff = (today.getTime() - d.getTime()) / (1000 * 60 * 60 * 24);
			return diff <= 7 && !sameDay(d, today) && !sameDay(d, yesterday);
		});

				
	});

	function sameDay(date1: Date, date2: Date) {
		return (
			date1.getDate() === date2.getDate() &&
			date1.getMonth() === date2.getMonth() &&
			date1.getFullYear() === date2.getFullYear()
		);
	}


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
			{#each todayCards as card (card.historyId)}
				<EndpointCard
					id={card.historyId}
					title={card.endpoint.name}
					description={card.endpoint.description}
					useDate={new Date(card.createdAt).toLocaleString('es-MX', {
						day: '2-digit',
						month: 'short',
						hour: '2-digit',
						minute: '2-digit',
						hour12: false
					})}
				/>
			{/each}

			<div class="col-span-4 flex items-center justify-end">
				<Button variant="text" size="md" onclick={() => goto('/history/today')}>See more</Button>
			</div>
		</div>
		<p class="text-bold my-4">Yesterday</p>
		<div id="yesterday" class="grid grid-cols-4 gap-12">
			{#each yesterdayCards as card (card.historyId)}
				<EndpointCard
					id={card.historyId}
					title={card.endpoint.name}
					description={card.endpoint.description}
					useDate={new Date(card.createdAt).toLocaleString('es-MX', {
						day: '2-digit',
						month: 'short',
						hour: '2-digit',
						minute: '2-digit',
						hour12: false
					})}
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
			{#each weekCards as card (card.historyId)}
				<EndpointCard
					id={card.historyId}
					title={card.endpoint.name}
					description={card.endpoint.description}
					useDate={new Date(card.createdAt).toLocaleString('es-MX', {
						day: '2-digit',
						month: 'short',
						hour: '2-digit',
						minute: '2-digit',
						hour12: false
					})}
					historyCard={true}
				/>
			{/each}

			<div class="col-span-4 flex items-center justify-end">
				<Button variant="text" size="md" onclick={() => goto('/history/week')}>See more</Button>
			</div>
		</div>
	</main>
</div>
