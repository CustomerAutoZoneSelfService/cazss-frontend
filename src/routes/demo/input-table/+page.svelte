<script lang="ts">
	import InputTable from '$lib/components/InputTable.svelte';
	import { VariableType, type RequestVariable } from '$lib/types/RequestVariable';
	import type { ResponsePattern } from '$lib/types/ResponsePattern';
	import type { InputTablePrompt } from '$lib/types/InputTablePrompt';
	let endpointId = 0;
	let responseId = 0;
	let variableType = VariableType.header;
	let ExampleVariables: RequestVariable[] = [
		{
			requestVariableId: 0,
			endpointId: endpointId,
			type: variableType,
			key: 'invoiceId',
			defaultValue: '7248374827',
			customizable: false,
			description: 'lorem'
		}
	];
	let ExampleResponses: ResponsePattern[] = [
		{
			responsePatternId: 0,
			responseId: 0,
			parentId: undefined,
			pattern: '',
			name: 'response1',
			description: 'lorem',
			isLeaf: false
		}
	];

	let HeadersPrompt: InputTablePrompt = {
		endpointId: endpointId,
		variableType: variableType,
		requestVariables: ExampleVariables
	};
	let ResponsesPrompt: InputTablePrompt = {
		responseId: responseId,
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
