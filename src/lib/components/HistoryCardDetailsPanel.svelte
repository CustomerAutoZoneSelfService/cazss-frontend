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
		async function loadHistoryDetails() {
			isLoadingDetails = true;
			if (historyId) {
				detailedHistoryData = await api.getDetailedHistory(historyId);
				console.log('History ID:', historyId);
				console.log('History details:', detailedHistoryData);
			} else {
				isLoadingDetails = false;
				console.error('No historyId provided');
				// Make state to show error
			}
			isLoadingDetails = false;
		}
		console.log('History ID:', historyId);
		console.log('History details:', detailedHistoryData);
		loadHistoryDetails();
	});

	//TODO: FIX THIS SO IT TAKES YOU TO THE EXECUTE PAGE WITH THE DATA
	function handleCallAgain() {
		if (detailedHistoryData) {
			// Store the history data in sessionStorage to be used by the home page
			sessionStorage.setItem(
				'prefilledEndpointData',
				JSON.stringify({
					endpointName: detailedHistoryData.endpoint.name,
					inputs: detailedHistoryData.historyData.request
				})
			);
			goto('/invokeEndpoint');
		}
	}
</script>

<div class="animate-slide-in scroll flex h-full w-full flex-col gap-6 overflow-y-auto p-8">
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
		<div class="flex min-h-[280px] flex-col gap-2 rounded-2xl bg-gray-100 p-6 shadow-md">
			<TextFormat as="div" size="subtitle" variant="primary" className="mb-2">Output</TextFormat>

			{#if !detailedHistoryData.historyData.response}
				<div class="overflow-auto rounded bg-white p-4 text-sm text-gray-500 shadow-inner">
					Expected response here: <br /><br />
					{`{\n  "message": "Lorem ipsum dolor sit amet, consectetur adipiscing elit",\n  "status": 200\n}`}
				</div>
			{:else}
				<div class="mb-1 flex flex-row items-start justify-between">
					<TextFormat as="span" size="body" variant="muted">Response:</TextFormat>
					<TextFormat
						as="span"
						size="body"
						variant="primary"
						className="bg-white rounded px-3 py-1 shadow text-right max-w-[16rem] break-words"
					>
						{JSON.stringify(detailedHistoryData.historyData.response, null, 2)}
					</TextFormat>
				</div>
			{/if}
		</div>

		<!-- Call again button -->
		<div class="mt-auto flex justify-end">
			<Button className="cursor-pointer" size="lg" variant="secondary" onClick={handleCallAgain}>
				Call again
			</Button>
		</div>
	{:else}
		<div class="p-8 text-center text-gray-500">No se pudo cargar el detalle.</div>
	{/if}
</div>

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
