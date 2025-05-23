<script lang="ts">
	import HeadingFormat from '$lib/components/HeadingFormat.svelte';
	import TextArea from '$lib/components/TextArea.svelte';
	import InputTable from '$lib/components/InputTable.svelte';
	import Button from '$lib/components/Button.svelte';
	import Select from '$lib/components/Select.svelte';
	import Input from '$lib/components/Input.svelte';
	import TextFormat from '$lib/components/TextFormat.svelte';
	import { VariableType } from '$lib/types/RequestVariable';
	//import type { RequestVariable } from '$lib/types/RequestVariable';
	//import type { ResponsePattern } from '$lib/types/ResponsePattern';
	import type { InputTablePrompt } from '$lib/types/InputTablePrompt';
	import type { Endpoint } from '$lib/types/Endpoint';
	import CheckBox from '$lib/components/CheckBox.svelte';
	//import AppContainer from '$lib/components/AppContainer.svelte';
	import { goto } from '$app/navigation';

	//Const Values, used for the Select components
	const methodNames = ['GET', 'POST', 'PUT', 'DELETE'];
	const methods = methodNames.map((method) => ({ value: method, label: method }));

	//TODO. Authentication strategies and categories must be gotten from the database
	//For now, here are some demonstrative values
	let authNames = ['BEARER_TOKEN_1', 'BEARER_TOKEN_2'];
	let authStrategies = authNames.map((authStrategy) => ({
		value: authStrategy,
		label: authStrategy
	}));

	let categoryNames = ['INVOICE', 'CACHE'];
	let categories = categoryNames.map((category) => ({ value: category, label: category }));

	let statusCodeNames = ['200', '201'];
	let statusCodes = statusCodeNames.map((statusCode) => ({ value: statusCode, label: statusCode }));
	//let selectedStatusCode = $state(statusCodeNames[0]);

	//Determines the part of the process shown, there are 3 parts
	let step = $state(1);
	// It is generated automatically when you insert it into the database
	let endpointId = 0;
	let responseId = 0;
	let template = $state('');
	let responseDescription = $state('');

	$effect(() => {
		console.log($state.snapshot(step));
	});

	let endpoint: Endpoint = $state({
		title: '',
		description: '',
		method: 'GET',
		url: '',
		authenticationStrategy: '',
		category: '',
		enabled: true,
		name: '' // <- Agrega esto
	});

	let headersPrompt: InputTablePrompt = {
		endpointId: endpointId,
		variableType: VariableType.header
	};
	let inlineParamPrompt: InputTablePrompt = {
		endpointId: endpointId,
		variableType: VariableType.inline_param
	};
	let queryStringPrompt: InputTablePrompt = {
		endpointId: endpointId,
		variableType: VariableType.query_string
	};
	let bodyVariablesPrompt: InputTablePrompt = {
		endpointId: endpointId,
		variableType: VariableType.body
	};

	let responsesPrompt: InputTablePrompt = {
		responseId: responseId
	};
	let headers: InputTable | undefined = $state();
	let inlineParams: InputTable | undefined = $state();
	let queryString: InputTable | undefined = $state();
	let bodyVariables: InputTable | undefined = $state();
	let responsePatterns: InputTable | undefined = $state();

	function goToNextPage() {
		step++;
	}
	function goToPreviousPage() {
		step--;
	}
	export function registerEndpoint() {
		goto('/');
	}
</script>

<div class="align-items justify-center">
	{#if step === 1}
		<main class="flex-1 bg-white p-8">
			<div class="mb-6 flex items-center justify-between">
				<div>
					<h1 class="text-2xl font-bold">New Endpoint</h1>
					<TextFormat as="p" variant="primary">Create a New Endpoint</TextFormat>
				</div>
				<div class="flex items-center"></div>
			</div>

			<form class="space-y-6">
				<div class="flex items-center space-x-4">
					<TextFormat as="label" variant="primary" size="subtitle">Title:</TextFormat>
					<Input bind:text={endpoint.title} boxSize="md" />
					<TextFormat as="label" variant="primary" size="subtitle">Enabled:</TextFormat>
					<CheckBox bind:checked={endpoint.enabled} />
				</div>

				<div>
					<TextFormat as="label" variant="primary" size="subtitle">Description:</TextFormat>
					<TextArea bind:text={endpoint.description} />
				</div>

				<div class="flex items-center space-x-8">
					<div class="flex items-center space-x-2">
						<TextFormat as="label" variant="primary" size="subtitle">Method:</TextFormat>
						<Select options={methods} bind:selected={endpoint.method} />
					</div>
					<div class="flex flex-1 items-center space-x-2">
						<TextFormat as="label" variant="primary" size="subtitle">URL</TextFormat>
						<Input bind:text={endpoint.url} boxSize="full" />
					</div>
				</div>

				<div class="flex items-center space-x-8">
					<div class="flex flex-1 items-center space-x-2">
						<TextFormat as="label" variant="primary" size="subtitle"
							>Authentication Strategy:</TextFormat
						>
						<Select options={authStrategies} bind:selected={endpoint.authenticationStrategy} />
					</div>
					<div class="flex flex-1 items-center space-x-2">
						<TextFormat as="label" variant="primary" size="subtitle">Category:</TextFormat>
						<Select options={categories} bind:selected={endpoint.category} />
					</div>
				</div>
			</form>
		</main>
	{/if}
	{#if step === 2}
		<div class="flex flex-col">
			<div class="py-2">
				<HeadingFormat as="h4">Headers</HeadingFormat>
				<InputTable prompt={headersPrompt} bind:this={headers} />
			</div>
			<div class="py-2">
				<HeadingFormat as="h4">In Line Params</HeadingFormat>
				<InputTable prompt={inlineParamPrompt} bind:this={inlineParams} />
			</div>
			<div class="py-2">
				<HeadingFormat as="h4">Query String</HeadingFormat>
				<InputTable prompt={queryStringPrompt} bind:this={queryString} />
			</div>
			<div class="py-2">
				<HeadingFormat as="h4">Body Template</HeadingFormat>
				<TextArea bind:text={template} />
			</div>
			<div class="py-2">
				<HeadingFormat as="h4">Body Variables</HeadingFormat>
				<InputTable prompt={bodyVariablesPrompt} bind:this={bodyVariables} />
			</div>
		</div>
	{/if}

	{#if step === 3}
		<div>
			<div class="py-2">
				<HeadingFormat as="h4">Status Code</HeadingFormat>
				<Select options={statusCodes} />
			</div>
			<div class="py-2">
				<HeadingFormat as="h4">Response Description</HeadingFormat>
				<TextArea bind:text={responseDescription} />
			</div>
			<div class="py-2">
				<HeadingFormat as="h4">Response Patterns</HeadingFormat>
				<InputTable prompt={responsesPrompt} bind:this={responsePatterns} />
			</div>
		</div>
	{/if}
	<div class="flex justify-end gap-x-20 py-8">
		{#if step > 1}
			<Button type="button" size="md" variant="secondary" onClick={goToPreviousPage}>BACK</Button>
		{/if}
		{#if step < 3}
			<Button type="button" size="md" variant="primary" onClick={goToNextPage}>NEXT</Button>
		{:else}
			<Button type="button" size="md" variant="primary" onClick={registerEndpoint}>REGISTER</Button>
		{/if}
	</div>
</div>
