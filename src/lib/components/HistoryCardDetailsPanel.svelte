<script lang="ts">
	import HeadingFormat from './HeadingFormat.svelte';
	import TextFormat from './TextFormat.svelte';
	import Button from './Button.svelte';
	import { goto } from '$app/navigation';

	let {
		title,
		titleHighlight = '',
		description = '',
		inputs = [],
		output = [],
		callAgainLabel = 'Call again',
		historyData = null
	} = $props<{
		title: string;
		titleHighlight?: string;
		description?: string;
		inputs: Array<{ label: string; value: string }>;
		output: Array<{ label: string; value: string }>;
		callAgainLabel?: string;
		historyData: { endpointName: string } | null;
	}>();

	// Helper to split title for highlight
	let titleParts = $derived(
		titleHighlight && title.includes(titleHighlight) ? title.split(titleHighlight) : null
	);

	function handleCallAgain() {
		if (historyData) {
			// Store the history data in sessionStorage to be used by the home page
			sessionStorage.setItem(
				'prefilledEndpointData',
				JSON.stringify({
					endpointName: historyData.endpointName,
					inputs: inputs
				})
			);
			goto('/');
		}
	}
</script>

<div class="animate-slide-in flex h-full w-full flex-col gap-6 p-8">
	<!-- Title -->
	<div class="flex flex-row items-center justify-between">
		<HeadingFormat as="h2" variant="primary">
			{#if titleParts}
				{titleParts[0]}<span class="text-[#AF8B2E]">{titleHighlight}</span>{titleParts[1]}
			{:else}
				{title}
			{/if}
		</HeadingFormat>
	</div>

	<!-- Description -->
	{#if description}
		<TextFormat as="p" size="body" variant="muted" className="mb-2">
			{description}
		</TextFormat>
	{/if}

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
		<Button size="lg" variant="secondary" onClick={handleCallAgain}>
			{callAgainLabel}
		</Button>
	</div>
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
