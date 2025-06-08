<script lang="ts">
	import { getContext } from 'svelte';
	import TextArea from '$lib/components/TextArea.svelte';
	import InputTable from '$lib/components/InputTable.svelte';
	import Button from '$lib/components/Button.svelte';
	import Select from '$lib/components/Select.svelte';
	import Input from '$lib/components/Input.svelte';
	import TextFormat from '$lib/components/TextFormat.svelte';
	import CheckBox from '$lib/components/CheckBox.svelte';
	import { goto } from '$app/navigation';
	import { VariableType } from '$lib/types/RequestVariable';
	import type { InputTablePrompt } from '$lib/types/InputTablePrompt';
	import type { CreateService, CreateResponse } from '$lib/types/CreateService';
	import type { RequestVariable } from '$lib/types/RequestVariable';
	import type { ResponsePattern } from '$lib/types/ResponsePattern';
	import type ApiWrapper from '$lib/ApiWrapper';
	import type { Service } from '$lib/types/ApiWrapper';

	let api: ApiWrapper = getContext('api');

	const methodNames = ['GET', 'POST', 'PUT', 'DELETE'];
	const methods = methodNames.map((method) => ({ value: method, label: method }));

	let authNames = ['BEARER_TOKEN_1', 'BEARER_TOKEN_2'];
	let authStrategies = authNames.map((authStrategy) => ({
		value: authStrategy,
		label: authStrategy
	}));

	let categoryNames = ['INVOICE', 'CACHE'];
	let categories = categoryNames.map((category) => ({ value: category, label: category }));

	let statusCodeNames = ['200', '201'];
	let statusCodes = $state(
		statusCodeNames.map((statusCode) => ({ value: statusCode, label: statusCode }))
	);
	let newStatusCode = $state('');
	let selectedStatusCode1 = $state('');
	//let selectedStatusCode2 = '';

	function addStatusCode() {
		const code = newStatusCode.trim();
		// Validar que sean exactamente 3 dígitos numéricos
		if (!/^\d{3}$/.test(code)) {
			alert('El código de estado debe tener exactamente 3 dígitos numéricos.');
			return;
		}
		// Verificar si ya existe
		if (!statusCodeNames.includes(code)) {
			statusCodeNames = [...statusCodeNames, code];
			statusCodes = statusCodeNames.map((statusCode) => ({ value: statusCode, label: statusCode }));
		}
		selectedStatusCode1 = code;
		newStatusCode = '';
	}

	let step = $state(1);
	let endpointId = 0;
	let responseId = 0;
	let responseDescription = $state('');

	$effect(() => {
		console.log($state.snapshot(step));
	});

	let endpoint: CreateService = $state({
		categoryId: -1,
		active: true,
		name: '',
		description: '',
		method: 'GET',
		url: '',
		authenticationStrategy: 0, // Currently not used

		template: '',
		requestVariables: [],
		responses: []
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
		if (step === 2) pullValuesFromTables();
		console.log($state.snapshot(endpoint));
		step++;
	}

	function goToPreviousPage() {
		if (step === 2) pullValuesFromTables();
		step--;
	}

	export function registerEndpoint() {
		const responsePatternsRaw = responsePatterns!.getVariables() as ResponsePattern[];
		const createResponse: CreateResponse = {
			statusCode: 200,
			description: 'lorem',
			patterns: []
		};
		for (let index = 0; index < responsePatternsRaw.length; index++) {
			const responsePattern = responsePatternsRaw[index];

			createResponse.patterns.push({
				parentId: responsePattern.parentId,
				name: responsePattern.name,
				description: responsePattern.description,
				isLeaf: responsePattern.isLeaf,
				pattern: responsePattern.pattern
			});
		}

		endpoint.responses.push(createResponse);
		fetchEndpoint($state.snapshot(endpoint));
		goto('/');
	}

	function pullValuesFromTables() {
		const headersDataRaw = headers!.getVariables() as RequestVariable[];
		const inlineParamsRaw = inlineParams!.getVariables() as RequestVariable[];
		const bodyRaw = bodyVariables!.getVariables() as RequestVariable[];
		const queryStringRaw = queryString!.getVariables() as RequestVariable[];

		// Headers
		for (let index = 0; index < headersDataRaw.length; index++) {
			const headers = headersDataRaw[index];

			endpoint.requestVariables.push({
				type: 'HEADER',
				key: headers.key,
				defaultValue: headers.defaultValue,
				customizable: headers.customizable,
				description: headers.description
			});
		}

		// Inline params
		for (let index = 0; index < inlineParamsRaw.length; index++) {
			const inlineParams = inlineParamsRaw[index];

			endpoint.requestVariables.push({
				type: 'INLINE',
				key: inlineParams.key,
				defaultValue: inlineParams.defaultValue,
				customizable: inlineParams.customizable,
				description: inlineParams.description
			});
		}

		// Body
		for (let index = 0; index < bodyRaw.length; index++) {
			const body = bodyRaw[index];

			endpoint.requestVariables.push({
				type: 'BODY',
				key: body.key,
				defaultValue: body.defaultValue,
				customizable: body.customizable,
				description: body.description
			});
		}

		// Query strings
		for (let index = 0; index < queryStringRaw.length; index++) {
			const queryString = queryStringRaw[index];

			endpoint.requestVariables.push({
				type: 'QUERY_STRING',
				key: queryString.key,
				defaultValue: queryString.defaultValue,
				customizable: queryString.customizable,
				description: queryString.description
			});
		}
	}

	async function fetchEndpoint(endpointData: CreateService) {
		try {
			endpointData.categoryId = 59; // The gods have chosen this value
			endpointData.authenticationStrategy = null;

			const response: Service = await api.createService(endpointData);
			console.log(response);
		} catch (error) {
			console.log(error);
		}
	}
</script>

<div class="align-items justify-center">
	{#if step === 1}
		<main class="flex-1 bg-white p-8">
			<div class="mb-6 flex items-center justify-between">
				<div>
					<h1 class="text-2xl font-bold">New Endpoint</h1>
					<TextFormat as="p" variant="muted">Create a New Endpoint</TextFormat>
				</div>
			</div>

			<form class="space-y-6">
				<div class="flex items-center space-x-4">
					<TextFormat as="label" variant="muted" size="subtitle">Title:</TextFormat>
					<Input bind:text={endpoint.name} boxSize="md" />
					<TextFormat as="label" variant="muted" size="subtitle">Enabled:</TextFormat>
					<CheckBox bind:checked={endpoint.active} />
				</div>

				<div>
					<TextFormat as="label" variant="muted" size="subtitle">Description:</TextFormat>
					<TextArea bind:text={endpoint.description} />
				</div>

				<div class="flex items-center space-x-8">
					<div class="flex items-center space-x-2">
						<TextFormat as="label" variant="muted" size="subtitle">Method:</TextFormat>
						<Select options={methods} bind:selected={endpoint.method} />
					</div>
					<div class="flex flex-1 items-center space-x-2">
						<TextFormat as="label" variant="muted" size="subtitle">URL:</TextFormat>
						<Input bind:text={endpoint.url} boxSize="full" />
					</div>
				</div>

				<div class="flex items-center space-x-8">
					<div class="flex flex-1 items-center space-x-2">
						<TextFormat as="label" variant="muted" size="subtitle"
							>Authentication Strategy:</TextFormat
						>
						<Select options={authStrategies} bind:selected={endpoint.authenticationStrategy!} />
					</div>
					<div class="flex flex-1 items-center space-x-2">
						<TextFormat as="label" variant="muted" size="subtitle">Category:</TextFormat>
						<Select options={categories} bind:selected={endpoint.categoryId} />
					</div>
				</div>
			</form>
		</main>
	{/if}

	{#if step === 2}
		<main class="flex-1 bg-white p-8">
			<h1 class="text-2xl font-bold">New Endpoint</h1>
			<div class="flex flex-col">
				<div class="py-2">
					<TextFormat as="label" variant="muted" size="subtitle">Headers:</TextFormat>
					<InputTable prompt={headersPrompt} bind:this={headers} />
				</div>
				<div class="py-2">
					<TextFormat as="label" variant="muted" size="subtitle">In Line Params:</TextFormat>
					<InputTable prompt={inlineParamPrompt} bind:this={inlineParams} />
				</div>
				<div class="py-2">
					<TextFormat as="label" variant="muted" size="subtitle">Query String:</TextFormat>
					<InputTable prompt={queryStringPrompt} bind:this={queryString} />
				</div>
				<div class="py-2">
					<TextFormat as="label" variant="muted" size="subtitle">Body Template:</TextFormat>
					<TextArea bind:text={endpoint.template} />
				</div>
				<div class="py-2">
					<TextFormat as="label" variant="muted" size="subtitle">Body Variables:</TextFormat>
					<InputTable prompt={bodyVariablesPrompt} bind:this={bodyVariables} />
				</div>
			</div>
		</main>
	{/if}

	{#if step === 3}
		<main class="flex-1 bg-white p-8">
			<h1 class="text-2xl font-bold">New Endpoint</h1>

			<!-- Add new status code -->
			<div class="flex items-center gap-2 py-2">
				<TextFormat as="label" variant="muted" size="subtitle">Add New Status Code:</TextFormat>
				<Input bind:text={newStatusCode} boxSize="sm" />
				<Button type="button" size="sm" variant="secondary" onClick={addStatusCode}>Add</Button>
			</div>

			<!-- Select an existing status code -->
			<div class="flex items-center gap-2 py-2">
				<TextFormat as="label" variant="muted" size="subtitle">Status Code:</TextFormat>
				<Select options={statusCodes} bind:selected={selectedStatusCode1} />
			</div>

			<div class="py-2">
				<TextFormat as="label" variant="muted" size="subtitle">Response Description:</TextFormat>
				<TextArea bind:text={responseDescription} />
			</div>

			<div class="py-2">
				<TextFormat as="label" variant="muted" size="subtitle">Response Patterns:</TextFormat>
				<InputTable prompt={responsesPrompt} bind:this={responsePatterns} />
			</div>
		</main>
	{/if}

	<!-- Navigation Buttons -->
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
