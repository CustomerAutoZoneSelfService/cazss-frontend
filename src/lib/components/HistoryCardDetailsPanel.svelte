<script lang="ts">
	import HeadingFormat from './HeadingFormat.svelte';
	import TextFormat from './TextFormat.svelte';
	import Button from './Button.svelte';
	import { onMount } from 'svelte';
	import ApiWrapper from '$lib/ApiWrapper';
	import LoadingSvg from './LoadingSVG.svelte';

	const {
		historyId,
		onCallAgain = null,
		callAgainLabel = 'Call again'
	} = $props<{ historyId: number; onCallAgain?: () => void; callAgainLabel?: string }>();

	let title = $state('');
	let titleHighlight: string = '';
	let description = $state('');
	let inputs = $state<{ label: string; value: string }[]>([]);
	let output = $state<{ label: string; value: string }[]>([]);
	let loading = $state(true);
	let error = $state('');

	onMount(async () => {
		loading = true;
		error = '';
		try {
			const api = new ApiWrapper();
			// Aquí deberías tener un endpoint para obtener detalles por historyId
			// Por ahora, simula los datos:
			// const details = await api.getHistoryDetails(historyId);
			// title = details.title;
			// ...
			title = `Detalle de historyId ${historyId}`;
			description = 'Descripción simulada.';
			inputs = [{ label: 'Input 1', value: 'Valor 112' }];
			output = [{ label: 'Output 1', value: 'Valor 2' }];
			console.log('HistoryCardDetailsPanel mounted', api);
		} catch (e) {
			error = 'No se pudo cargar el detalle.';
			console.error('Error loading details:', e);
		} finally {
			loading = false;
		}
	});
	// TODO: USE THE SAME AS THE ONE IN THE CARD
	// MAKE IT A UTIL
	let titleParts = $derived(
		titleHighlight && title.includes(titleHighlight) ? title.split(titleHighlight) : null
	);
</script>

{#if loading}
	<LoadingSvg />
{:else if error}
	<div class="p-8 text-red-500">{error}</div>
{:else}
	<div class="animate-slide-in flex h-full w-full flex-col gap-6 p-8">
		<!-- Title -->
		<div class="mx-auto flex flex-row items-center">
			<HeadingFormat as="h2" variant="primary">
				{#if titleParts}
					{titleParts[0]}<span class="text-[#AF8B2E]">{titleHighlight}</span>{titleParts[1]}
				{:else}
					{title}
				{/if}
			</HeadingFormat>
		</div>

		<hr class="border-t border-gray-300" />
		<!-- Description -->
		<div class="mx-auto">
			<TextFormat as="p" size="body" variant="muted" className="mb-2">
				{description}
			</TextFormat>
		</div>

		<!-- Inputs Box -->
		<div class="flex flex-col gap-2 rounded-2xl bg-gray-100 p-6 shadow-md">
			<TextFormat as="div" size="subtitle" variant="primary" className="mb-2">Inputs</TextFormat>
			{#each inputs as input (input.label)}
				<div class="mb-1 flex flex-row items-center justify-between">
					<TextFormat as="span" size="body" variant="muted">{input.label}:</TextFormat>
					<TextFormat
						as="span"
						size="body"
						variant="primary"
						className="bg-white rounded px-3 py-1 shadow text-right min-w-[6rem]"
						>{input.value}</TextFormat
					>
				</div>
			{/each}
		</div>

		<!-- Output Box -->
		<div class="flex min-h-[120px] flex-col gap-2 rounded-2xl bg-gray-100 p-6 shadow-md">
			<TextFormat as="div" size="subtitle" variant="primary" className="mb-2">Output</TextFormat>
			{#if output.length === 0}
				<TextFormat as="span" size="body" variant="muted">No output</TextFormat>
			{:else}
				{#each output as item (item.label)}
					<div class="mb-1 flex flex-row items-center justify-between">
						<TextFormat as="span" size="body" variant="muted">{item.label}:</TextFormat>
						<TextFormat as="span" size="body" variant="primary">{item.value}</TextFormat>
					</div>
				{/each}
			{/if}
		</div>

		<!-- Call again button -->
		<div class="mt-auto flex justify-end">
			<Button size="lg" variant="secondary" onClick={onCallAgain}>
				{callAgainLabel}
			</Button>
		</div>
	</div>
{/if}

<style>
	.animate-slide-in {
		animation: slide-in 0.3s ease-out;
	}

	@keyframes slide-in {
		from {
			transform: translateX(100%);
			opacity: 0;
		}
		to {
			transform: translateX(0);
			opacity: 1;
		}
	}
</style>
