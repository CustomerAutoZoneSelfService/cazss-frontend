<script lang="ts">
	import HeadingFormat from '$lib/components/HeadingFormat.svelte';
	import Tooltip from '$lib/components/Tooltip.svelte';
	import List from '$lib/components/List.svelte';
	import TextArea from '$lib/components/TextArea.svelte';
	import type { ServiceResponse } from '$lib/types/ServiceResponse';

	export let ExecutionResponse: ServiceResponse;
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
		{#if ExecutionResponse.response.some((variable) => 'content' in variable)}
			<!--
				<PdfViewer data={atob(ExecutionResponse.response.find(v => 'content' in v)?.content)} />
				-->
			<p>Here goes the pdf visualizer and the button</p>
		{:else}
			<List type="ul">
				{#each ExecutionResponse.response as variableResponse, index (index)}
					{#each Object.entries(variableResponse) as [key, value], innerIndex (innerIndex)}
						<li><b>{key}:</b> {value.join(', ')}</li>
					{/each}
				{/each}
			</List>
			<TextArea
				disabled={true}
				text={ExecutionResponse.response ? JSON.stringify(ExecutionResponse.response) : ''}
			/>
		{/if}
	</div>
</main>
