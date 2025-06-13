<script lang="ts">
	import InputTable from '$lib/components/InputTable.svelte';
	import type { ResponsePattern, RequestVariable } from '$lib/types/ConfigureService';
	import type { InputTablePrompt } from '$lib/types/InputTablePrompt';
	let ExampleVariables: RequestVariable[] = [
		{
			type: 'HEADER',
			key: 'invoiceId',
			defaultValue: '7248374827',
			customizable: false,
			description: 'lorem'
		}
	];
	let ExampleResponses: ResponsePattern[] = [
		{
			responsePatternId: 0,
			parentId: null,
			pattern: '',
			name: 'response1',
			description: 'lorem',
			isLeaf: false
		}
	];

	let HeadersPrompt: InputTablePrompt = {
		requestVariableType: 'HEADER',
		requestVariables: ExampleVariables
	};
	let ResponsesPrompt: InputTablePrompt = {
		responsePatterns: ExampleResponses
	};
	let Headers: InputTable;
	let Responses: InputTable;
	function displayVariables() {
		console.log('Headers: ', $state.snapshot(Headers.getVariables()));
		console.log('Responses: ', $state.snapshot(Responses.getVariables()));
	}
	//let Response: any;
</script>

<InputTable prompt={HeadersPrompt} bind:this={Headers} />
<InputTable prompt={ResponsesPrompt} bind:this={Responses} />

<button onclick={() => displayVariables()}>Send</button>
