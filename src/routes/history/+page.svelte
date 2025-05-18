<script lang="ts">
	import EndpointCard from '$lib/components/EndpointCard.svelte';
	import Button from '$lib/components/Button.svelte';
	import { goto } from '$app/navigation';

	const mockEndpointCards = Array.from({ length: 12 }, (_, i) => {
		const date = new Date();
		date.setDate(date.getDate());
		return {
			id: 400 + i,
			title: 'Hora actual',
			description: 'Esta es una prueba de a ver cómo saldría la card con la hora',
			useDate: date.toLocaleString('es-MX', {
				day: '2-digit',
				month: 'short',
				hour: '2-digit',
				minute: '2-digit'
			}),
			historyCard: true
		};
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
			{#each mockEndpointCards as card (card.id)}
				<EndpointCard
					id={card.id}
					title={card.title}
					description={card.description}
					useDate={card.useDate}
					historyCard={card.historyCard}
				/>
			{/each}
			<div class="col-span-4 flex items-center justify-end">
				<Button variant="text" size="md" onclick={() => goto('/history/today')}>See more</Button>
			</div>
		</div>
		<p class="text-bold my-4">Yesterday</p>
		<div id="yesterday" class="grid grid-cols-4 gap-12">
			{#each mockEndpointCards as card (card.id)}
				<EndpointCard
					id={card.id}
					title={card.title}
					description={card.description}
					useDate={card.useDate}
					historyCard={card.historyCard}
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
			{#each mockEndpointCards as card (card.id)}
				<EndpointCard
					id={card.id}
					title={card.title}
					description={card.description}
					useDate={card.useDate}
					historyCard={card.historyCard}
				/>
			{/each}
			<div class="col-span-4 flex items-center justify-end">
				<Button variant="text" size="md" onclick={() => goto('/history/week')}>See more</Button>
			</div>
		</div>
	</main>
</div>
