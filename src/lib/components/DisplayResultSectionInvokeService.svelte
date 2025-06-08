<script lang="ts">
	import HeadingFormat from '$lib/components/HeadingFormat.svelte';
	import TextFormat from '$lib/components/TextFormat.svelte';
	import List from '$lib/components/List.svelte';
	import TextArea from '$lib/components/TextArea.svelte';
	import type { ServiceResponse } from '$lib/types/ServiceResponse';
	import PdfViewer from './PdfViewer.svelte';
	import { createEventDispatcher } from 'svelte';

	import Button from '$lib/components/Button.svelte';
	import type { Filter } from '$lib/types/Filter';
	import Badge from '$lib/components/Badge.svelte';
	export let filters: Filter[] = [];
	export let ExecutionResponse: ServiceResponse;
	export let endpointId: number;
	console.log('FILTERS IN COMPONENT:', filters);

	async function updateUserFilters(updatedFilters: KeyValue[]) {
		try {
			const body = {
				endpointId,
				responsePatternIds: updatedFilters.map((f) => Number(f.value))
			};
			await api.createUserFilters(endpointId, body);
		} catch (err) {
			console.error('Failed to update filters:', err);
		}
	}

	const dispatch = createEventDispatcher();

	const PDF_PREFIX = 'JVBERi0';

	function isValidPdfBase64(content: string): boolean {
		return content.trim().startsWith(PDF_PREFIX);
	}
</script>

<main>
	<!-- Response Section -->
	<div class="space-y-4">
		<div class="flex items-center justify-between gap-10">
			<div>
				<span class="inline-flex items-center gap-2">
					<HeadingFormat variant="primary">Response</HeadingFormat>
					<Badge code={ExecutionResponse.status.code} />
				</span>
				<span class="flex">{ExecutionResponse.status.description}</span>
			</div>
			{#if filters.length > 0}
				<div>
					<Button
						type="button"
						class="cursor-pointerfocus:outline-none bg-accent-red hover:bg-accent-red-dark inline-flex cursor-pointer items-center justify-center rounded-[50px] px-4 py-2 text-sm font-bold text-white uppercase
                                   transition-all duration-200 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50"
						onClick={() => dispatch('openFilters')}
					>
						Edit Filters
					</Button>
				</div>
			{/if}
		</div>

		<!--
		If it contains the key -1, it means there are no response patterns registered which leads to two cases.
			- It is a pdf in which case we render the pdf viewer tag
			- We print the raw response
		If it contains response patterns, we render the list given the user filters
		-->
		{#if '-1' in ExecutionResponse.response}
			{#if isValidPdfBase64(ExecutionResponse.response['-1'][0])}
				<PdfViewer data={`data:application/pdf;base64,${ExecutionResponse.response['-1'][0]}`} />
			{:else}
				<TextArea
					disabled={true}
					text={ExecutionResponse.response
						? JSON.stringify(ExecutionResponse.response, null, 2)
						: ''}
				/>
			{/if}
		{:else}
			<div class="mt-6 ml-7 flex flex-col gap-4">
				{#each filters as filter (filter.responsePatternId)}
					<div>
						<TextFormat as="span" variant="primary" size="subtitle">
							{filter.name}
						</TextFormat>

						{#if filter.description}
							<div class="text-sm text-gray-500">{filter.description}</div>
						{/if}

						<List type="ul">
							{#each ExecutionResponse.response[filter.responsePatternId.toString()] ?? [] as value, index (index)}
								<li class="ml-3">{value}</li>
							{/each}
						</List>
					</div>
				{/each}
			</div>
		{/if}
	</div>
</main>
