<script lang="ts">
	import HeadingFormat from '$lib/components/HeadingFormat.svelte';
	import Tooltip from '$lib/components/Tooltip.svelte';
	import TextArea from '$lib/components/TextArea.svelte';
	import type { ServiceResponse } from '$lib/types/ServiceResponse';
	import PdfViewer from './PdfViewer.svelte';
	export let ExecutionResponse: ServiceResponse;
	console.log(ExecutionResponse.response.content[0]);
</script>

<main>
	<!-- Response Section -->
	<div class="space-y-4">
		<HeadingFormat as="h3" disabled={true}
			>Response
			<Tooltip value={ExecutionResponse.status.description}
				>(Status code: {ExecutionResponse.status.code})</Tooltip
			>
		</HeadingFormat>

		<HeadingFormat as="h4" disabled={true}>Raw body</HeadingFormat>
		{#if !['<', '>', '{', '}'].every((c) => {
			return ExecutionResponse.response.content[0].includes(c);
		}) && ExecutionResponse.response.content[0].length > 3500}
			<PdfViewer data={`data:application/pdf;base64,` + ExecutionResponse.response.content[0]} />
		{:else}
			<!--
					<List type="ul">
				{#each ExecutionResponse.response.content as variableResponse}
					index (index)

					{#each Object.entries(variableResponse) as [key, value]}
						{#if filters.length === 0 || filters.some((f) => f.key === key)}
							<li><b>{key}:</b> {value.join(', ')}</li>
						{/if}
					{/each}
				{/each}
			</List>
			-->

			<TextArea
				disabled={true}
				text={ExecutionResponse.response ? JSON.stringify(ExecutionResponse.response) : ''}
			/>
		{/if}
	</div>
</main>
