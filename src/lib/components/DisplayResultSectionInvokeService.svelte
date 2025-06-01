<script lang="ts">
	import HeadingFormat from '$lib/components/HeadingFormat.svelte';
	import Tooltip from '$lib/components/Tooltip.svelte';
	import TextArea from '$lib/components/TextArea.svelte';
	import List from './List.svelte';
	import type { ServiceResponse } from '$lib/types/ServiceResponse';
	import PdfViewer from './PdfViewer.svelte';
	export let ExecutionResponse: ServiceResponse;
	let keys: string[] = Object.keys(ExecutionResponse.response);

	console.log(ExecutionResponse);
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

		<List type="ul">
			{#each keys as key (key)}
				<div>
					{#if !['<', '>', '{', '}'].every((c) => {
						return ExecutionResponse.response[Number(key)][0].includes(c);
					}) && ExecutionResponse.response[Number(key)][0].length > 3500}
						<PdfViewer
							data={`data:application/pdf;base64,` + ExecutionResponse.response[Number(key)][0]}
						/>
					{:else}
						<li><b>{key}:</b>{ExecutionResponse.response[Number(key)][0]}</li>
					{/if}
				</div>
			{/each}
		</List>

		<TextArea text={JSON.stringify(ExecutionResponse)}></TextArea>
	</div>
</main>
