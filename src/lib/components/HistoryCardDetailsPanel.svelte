<script lang="ts">
	import HeadingFormat from './HeadingFormat.svelte';
	import TextFormat from './TextFormat.svelte';
	import Button from './Button.svelte';
	import { goto } from '$app/navigation';
	import { onMount, getContext } from 'svelte';
	import type ApiWrapper from '$lib/ApiWrapper';
	import LoadingSvg from './LoadingSVG.svelte';
	import type { DetailedHistoryService } from '$lib/types/ApiWrapper';

	const { historyId = null } = $props<{
		historyId?: number | null;
	}>();

	let api: ApiWrapper = getContext('api');
	let isLoadingDetails = $state(true);

	let detailedHistoryData = $state<DetailedHistoryService | null>(null);

	onMount(() => {
		loadHistoryDetails();
	});

	async function loadHistoryDetails() {
		isLoadingDetails = true;

		try {
			if (!historyId) {
				throw new Error('No historyId provided');
			}

			detailedHistoryData = await api.getDetailedHistory(historyId);
		} catch (error) {
			console.error('Error loading history details:', error);
			detailedHistoryData = null;
			// TODO : Show an error message to the user with the dialog
		} finally {
			isLoadingDetails = false;
		}
	}

	//TODO: FIX THIS SO IT TAKES YOU TO THE EXECUTE PAGE WITH THE DATA
	function handleCallAgain() {
		if (detailedHistoryData) {
			// Convierte el request en un array de objetos { label, value }
			const prefilledInputs = Object.entries(detailedHistoryData.historyData.request ?? {}).map(
				([label, value]) => ({ label, value })
			);
			const prefilledParam = encodeURIComponent(JSON.stringify(prefilledInputs));
			goto(`/endpoint/${detailedHistoryData.endpoint.endpointId}?prefilled=${prefilledParam}`);
		}
	}
</script>

<div class="scroll mt-4 flex h-full w-full flex-col gap-6 overflow-y-auto p-8">
	{#if isLoadingDetails}
		<div class="flex h-full items-center justify-center">
			<LoadingSvg />
		</div>
	{:else if detailedHistoryData}
		<!-- Title -->
		<div class="flex flex-row items-center justify-between">
			<HeadingFormat as="h2" variant="primary">
				{detailedHistoryData.endpoint.name}
			</HeadingFormat>
		</div>

		<!-- Description -->
		{#if detailedHistoryData.endpoint.description}
			<TextFormat as="p" size="body" variant="muted" className="mb-2">
				{detailedHistoryData.endpoint.description}
			</TextFormat>
		{/if}

		<!-- Inputs Box -->
		<div class="flex flex-col gap-2 rounded-2xl bg-gray-100 p-6 shadow-md">
			<TextFormat as="div" size="subtitle" variant="primary" className="mb-2">Inputs</TextFormat>
			{#each Object.entries(detailedHistoryData.historyData.request ?? {}) as [key, value] (key)}
				<div class="mb-1 flex flex-row items-center justify-between">
					<TextFormat as="span" size="body" variant="muted">{key}:</TextFormat>
					<TextFormat
						as="span"
						size="body"
						variant="primary"
						className="bg-white rounded px-3 py-1 shadow text-right min-w-[6rem]"
						>{value}</TextFormat
					>
				</div>
			{/each}
		</div>

		<!-- Output Box -->
		<div class="flex flex-col gap-2 rounded-2xl bg-gray-100 p-6 shadow-md">
			<TextFormat as="div" size="subtitle" variant="primary" className="mb-2">Inputs</TextFormat>
			{#each Object.entries(detailedHistoryData.historyData.response ?? {}) as [key, value] (key)}
				<div class="mb-1 flex flex-row items-center justify-between">
					<TextFormat as="span" size="body" variant="muted">{key}:</TextFormat>
					<TextFormat
						as="span"
						size="body"
						variant="primary"
						className="bg-white rounded px-3 py-1 shadow text-right min-w-[6rem] max-w-[10rem]"
						>{value}</TextFormat
					>
				</div>
			{/each}
		</div>

		<!-- Call again button -->
		<div class="mt-auto flex justify-end">
			<Button className="cursor-pointer" size="lg" variant="secondary" onClick={handleCallAgain}>
				Call again
			</Button>
		</div>
	{:else}
		<div class="flex h-full flex-col items-center justify-center text-center">
			<p class="text-lg font-semibold" style="color: #af1624">Error al cargar los detalles.</p>
			<p class="mt-2 text-sm text-gray-500">
				Intenta de nuevo más tarde o selecciona otra tarjeta.
			</p>
		</div>
	{/if}
</div>
