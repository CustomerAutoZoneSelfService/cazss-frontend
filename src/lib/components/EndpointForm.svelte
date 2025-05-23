<!--
    EndpointForm.svelte

    Reusable Svelte component for both creating and editing API endpoints.

    Props:
    - endpoint: DetailedService
        The main endpoint object. Use bind:endpoint for two-way binding.
    - requestVariables: Record<string, RequestVariable[]>
        Headers, inline params, query strings, and body variables, grouped by type.
    - responsePatternsData: ResponsePattern
        Patterns for endpoint responses.
    - onSubmit: () => void
        Function to call when the user submits the form.

    Usage:
    - For "create", pass empty/default objects as props.
    - For "edit", pass the endpoint and related data to pre-fill the form.
    - All form fields are controlled by the parent via props and bindings.
    - The component supports multi-step navigation (step 1: basic info, step 2: variables, step 3: responses).

    This design allows you to use the same form for both creating new endpoints and editing existing ones, ensuring consistency and reusability.
-->

<script lang="ts">
	// Components
	import TextArea from '$lib/components/TextArea.svelte';
	import InputTable from '$lib/components/InputTable.svelte';
	import Button from '$lib/components/Button.svelte';
	import Select from '$lib/components/Select.svelte';
	import Input from '$lib/components/Input.svelte';
	import TextFormat from '$lib/components/TextFormat.svelte';
	import CheckBox from '$lib/components/CheckBox.svelte';

	// Types
	import type { Props } from '$lib/types/EndpointForm';
	import { VariableType } from '$lib/types/RequestVariable';
	import type { ResponseStatusEntry } from '$lib/types/ResponseStatusEntry';
	import type { RequestVariable } from '$lib/types/RequestVariable';
	import type { ResponsePattern } from '$lib/types/ResponsePattern';
	import type { DetailedService } from '$lib/types/ApiWrapper';
	import type { HTTPMethod } from '$lib/types/ApiWrapper';

	// Variables definitions | Detailed Endpoint Data, Prompts

	let { onSubmit }: Props = $props();

	let step = $state(1);

	function goToNextPage() {
		step++;
	}
	function goToPreviousPage() {
		step--;
	}

	$effect(() => {
		console.log('step:', $state.snapshot(step));
	});

	// Options for method, auth strategies, categories, and status codes
	// These should be fetched from the backend later

	const methods = [
		{ value: 'GET', label: 'GET' },
		{ value: 'POST', label: 'POST' },
		{ value: 'PUT', label: 'PUT' },
		{ value: 'DELETE', label: 'DELETE' }
	];

	let authStrategies = [
		{ value: 'BEARER_TOKEN_1', label: 'BEARER_TOKEN_1' },
		{ value: 'BEARER_TOKEN_2', label: 'BEARER_TOKEN_2' }
	];

	let categories = [
		{ value: 0, label: 'INVOICE' },
		{ value: 1, label: 'CACHE' }
	];

	let statusCodesList: ResponseStatusEntry[] = $state([
		{ value: 200, description: 'OK', patterns: [] },
		{ value: 201, description: 'Created', patterns: [] },
		{ value: 204, description: 'No Content', patterns: [] },
		{ value: 400, description: 'Bad Request', patterns: [] }
	]);

	let statusCodesOptions = $state<{ value: number; label: string }[]>([]);

	$effect(() => {
		statusCodesOptions = statusCodesList.map((sc) => ({
			value: sc.value,
			label: String(sc.value)
		}));
	});

	// Headers, In Line Params, Query String, Body Template, Body Variables definitions
	

	let headers: InputTable;
	let inlineParams: InputTable;
	let queryString: InputTable;
	let bodyVariables: InputTable;
	let responsePatterns: InputTable;

	export function getRequestVariables() {
		console.log('Headers:', headers ? $state.snapshot(headers.getVariables()) : null);
		let requestVariables: Record<string, RequestVariable[]> = {
			header: (headers?.getVariables() as RequestVariable[]) || [],
			inline_param: (inlineParams?.getVariables() as RequestVariable[]) || [],
			query_string: (queryString?.getVariables() as RequestVariable[]) || [],
			bodyVariables: (bodyVariables?.getVariables() as RequestVariable[]) || []
		};
		return requestVariables;
	}

	export function getDetailedService() {
		let endpoint: DetailedService = {
			id,
			categoryId,
			authenticationStrategy,
			name,
			description,
			active,
			method,
			url,
			template
		};
		return endpoint;
	}


	// To add a NewStatusCode and description, both immediatly added in the form and further sent to the backend

	let id = $state(0);
	let categoryId = $state(0);
	let authenticationStrategy = $state('');
	let name = $state('');
	let description = $state('');
	let active = $state(true);
	let method = $state('GET' as HTTPMethod);
	let url = $state('');
	let template = $state('');
	let newStatusCode = $state('0');
	let newStatusDescription = $state('');
	let selectedStatusCode = $state(0);

	export function getStatusCodes() {
		let statusCodes: ResponseStatusEntry[] = [
			{
				value: selectedStatusCode,
				description: newStatusDescription,
				patterns: responsePatterns?.getVariables() as ResponsePattern[]
			}
		];

		return statusCodes;
	}

	//Agregar un nuevo status code y su descripcion
	function addStatusCode() {
		// Convierte el input a número
		const code = Number(newStatusCode);
		const description = newStatusDescription.trim();

		if (code < 100 || code > 999) {
			alert('El código debe tener exactamente 3 dígitos numéricos.');
			return;
		}
		if (!description) {
			alert('Debes proporcionar una descripción.');
			return;
		}
		if (statusCodesList.find((sc) => sc.value === code)) {
			alert('Este código ya fue agregado.');
			return;
		}

		const newEntry = { value: code, description, patterns: [] };
		statusCodesList = [...statusCodesList, newEntry];

		selectedStatusCode = code;
		newStatusCode = '';
		newStatusDescription = '';
	}

	// function addNewDescriptionToField() {
	

	// Prompts for InputTable for headers, inline params, query strings, and body variables

	let headersPrompt = $state({ endpointId: 0, variableType: VariableType.header });
	let inlineParamPrompt = $state({ endpointId: 0, variableType: VariableType.inline_param });
	let queryStringPrompt = $state({ endpointId: 0, variableType: VariableType.query_string });
	let bodyVariablesPrompt = $state({ endpointId: 0, variableType: VariableType.body });

	//Prompts for InputTable for response patterns

	let responseId = 0; // for editing is neccesary, for creating it is not
	let responsesPatternPrompt = $state({ responseId });
</script>

<div class="align-items justify-center">
	<!-- Title, Description, Active, Method, URL, *Auth, *Category -->
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
					<Input bind:text={name} boxSize="md" />
					<TextFormat as="label" variant="muted" size="subtitle">Enabled:</TextFormat>
					<CheckBox bind:checked={active} />
				</div>

				<div>
					<TextFormat as="label" variant="muted" size="subtitle">Description:</TextFormat>
					<TextArea bind:text={description} />
				</div>

				<div class="flex items-center space-x-8">
					<div class="flex items-center space-x-2">
						<TextFormat as="label" variant="muted" size="subtitle">Method:</TextFormat>
						<Select options={methods} bind:selected={method} />
					</div>
					<div class="flex flex-1 items-center space-x-2">
						<TextFormat as="label" variant="muted" size="subtitle">URL:</TextFormat>
						<Input bind:text={url} boxSize="full" />
					</div>
				</div>
				<!-- AUTH AND CATEGORIES NOT YET IMPLEMENTED -->
				<div class="flex items-center space-x-8">
					<div class="flex flex-1 items-center space-x-2">
						<TextFormat as="label" variant="muted" size="subtitle"
							>Authentication Strategy:</TextFormat
						>
						<Select options={authStrategies} bind:selected={authenticationStrategy} />
					</div>
					<div class="flex flex-1 items-center space-x-2">
						<TextFormat as="label" variant="muted" size="subtitle">Category:</TextFormat>
						<Select options={categories} bind:selected={categoryId} />
					</div>
				</div>
			</form>
		</main>
		{console.log(
			'endpoint:',
			name,
			description,
			active,
			method,
			url,
			authenticationStrategy,
			categoryId
		)}
	{/if}
	<!-- Headers, In Line Params, Query String, Body Template, Body Variables -->
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
					<TextArea bind:text={template} />
				</div>
				<div class="py-2">
					<TextFormat as="label" variant="muted" size="subtitle">Body Variables:</TextFormat>
					<InputTable prompt={bodyVariablesPrompt} bind:this={bodyVariables} />
				</div>
			</div>
		</main>
	{/if}
	<!-- Add New Status Code, Select Existing Status Code, Response Description, Response Patterns -->
	{#if step === 3}
		<main class="flex-1 bg-white p-8">
			<h1 class="text-2xl font-bold">New Endpoint</h1>

			<!-- Add new status code -->
			<div class="flex items-center gap-2 py-2">
				<TextFormat as="label" variant="muted" size="subtitle">Add New Status Code:</TextFormat>
				<Input bind:text={newStatusCode} boxSize="sm" placeholder="Status Code" />
				<Input bind:text={newStatusDescription} boxSize="sm" placeholder="Description" />
				<Button type="button" size="sm" variant="secondary" onClick={addStatusCode}>Add</Button>
			</div>

			<!-- Select an existing status code -->
			<div class="flex items-center gap-2 py-2">
				<TextFormat as="label" variant="muted" size="subtitle">Status Code:</TextFormat>
				<Select options={statusCodesOptions} bind:selected={selectedStatusCode} />
			</div>

			<div class="py-2">
				<TextFormat as="label" variant="muted" size="subtitle">Response Description:</TextFormat>
				<TextArea bind:text={newStatusDescription} />
			</div>

			<div class="py-2">
				<TextFormat as="label" variant="muted" size="subtitle">Response Patterns:</TextFormat>
				<InputTable prompt={responsesPatternPrompt} bind:this={responsePatterns} />
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
			<Button type="button" size="md" variant="primary" onClick={() => onSubmit && onSubmit()}>
				REGISTER
			</Button>
		{/if}
	</div>
</div>
