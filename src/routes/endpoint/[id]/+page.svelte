<script lang="ts">
	/*
	 * Endpoint Page
	 *
	 * This page is responsible for allowing the user to input their request variables for the endpoint (in case they exist)
	 * and allowing him to send it.
	 */

	import { getContext } from 'svelte';
	import { page } from '$app/stores';
	import Button from '$lib/components/Button.svelte';
	import HeadingFormat from '$lib/components/HeadingFormat.svelte';
	import TextArea from '$lib/components/TextArea.svelte';
	import TextFormat from '$lib/components/TextFormat.svelte';
	import Input from '$lib/components/Input.svelte';
	import Tooltip from '$lib/components/Tooltip.svelte';
	import { goto } from '$app/navigation';
	import type { Params } from './+page';
	import type { DetailedService, KeyValue } from '$lib/types/ApiWrapper';
	import type { RequestVariableString, VariableTypeString } from '$lib/types/RequestVariable';
	import type { RequestService } from '$lib/types/RequestService';
	import type { ServiceResponse } from '$lib/types/ServiceResponse';
	import type ApiWrapper from '$lib/ApiWrapper';

	import List from '$lib/components/List.svelte';
	let api: ApiWrapper = getContext('api');

	let { data }: { data: Params['params'] } = $props();

	const phase: string[] = ['variables', 'initialFilters', 'results', 'filters'];
	let phaseIndex: number = $state(0);

	let disabledForward: boolean = $state(false);
	let disabledBackwards: boolean = $state(false);
	let selectedFilterIds = $state<number[]>([]);
	let defaultFilterIds = $state<number[]>([]);
	let hasUserFilters = $state(false);

	let endpoint = $state<DetailedService>({
		id: data.id,
		name: '',
		description: '',
		active: false,
		method: 'GET',
		url: '',
		responses: [],
		filters: [],
		variables: [],
		requestBody: ''
	});

	// Derived runes that manages the RequestVariableString arrays
	let headers = $derived<RequestVariableString[]>(
		endpoint.variables.filter((variable) => variable.type === 'HEADER')
	);
	let body = $derived<RequestVariableString[]>(
		endpoint.variables.filter((variable) => variable.type === 'BODY')
	);
	let inline_params = $derived<RequestVariableString[]>(
		endpoint.variables.filter((variable) => variable.type === 'INLINE_PARAM')
	);
	let query_strings = $derived<RequestVariableString[]>(
		endpoint.variables.filter((variable) => variable.type === 'QUERY_STRING')
	);

	// Derived State that manages the array containing the RequestVariableString arrays filtered by type
	let variableTypes = $derived<RequestVariableString[][]>([
		headers,
		body,
		inline_params,
		query_strings
	]);

	// Map for names in the header
	let variableTypeHeadingMap = new Map<string, string>();
	variableTypeHeadingMap.set('HEADER', 'Headers');
	variableTypeHeadingMap.set('BODY', 'Body Variables');
	variableTypeHeadingMap.set('INLINE_PARAM', 'Inline Parameters');
	variableTypeHeadingMap.set('QUERY_STRING', 'Query Strings');

	// State that manages the RequestService object
	let requestService = $state<RequestService>({
		id: data.id,
		headers: [],
		body: [],
		inline: [],
		queryString: []
	});

	// This should change when the execute service in backend is ready, and we have the type defined
	// I figure the response status will have a ResponseStatus Type, and that will be accessed in the response section of the page
	let ExecutionResponse = $state<ServiceResponse>({
		status: {
			code: 0,
			description: ''
		},
		response: []
	});

	// Mock Response to test UI if the backend is unavailable / the database is empty
	/*
	let mockExecutionResponse:ServiceResponse = {
		status: {
    code: 200,
    description: "Success",
  	},
		response: [
			{
				"firstName": ["John"],
				"lastName": ["Doe"],
				"age": ["30"],
			},
			{
				"productName": ["Laptop"],
				"price": ["1200"],
				"features": ["Intel Core i7", "16GB RAM", "512GB SSD"],
			},
			{
				"city": ["Chihuahua"],
				"country": ["Mexico"],
			},
		],
	};
	*/

	// Function to initialize the RequestService object with the variables from the endpoint and possible default values
	const initializeRequestService = (variables: RequestVariableString[]) => {
		const newHeaders: KeyValue[] = [];
		const newBody: KeyValue[] = [];
		const newInline: KeyValue[] = [];
		const newQueryString: KeyValue[] = [];

		// Check for pre-filled data in URL
		const prefilledData = $page.url.searchParams.get('prefilled');
		const prefilledInputs: Array<{ label: string; value: string }> = prefilledData
			? JSON.parse(prefilledData)
			: [];

		variables.forEach((variable) => {
			// Try to find pre-filled value first
			const prefilledInput = prefilledInputs.find((input) => input.label === variable.keyName);
			const defaultValue = prefilledInput ? prefilledInput.value : (variable.defaultValue ?? '');

			const kv: KeyValue = { key: variable.keyName, value: defaultValue };
			switch (variable.type) {
				case 'HEADER':
					newHeaders.push(kv);
					break;
				case 'BODY':
					newBody.push(kv);
					break;
				case 'INLINE_PARAM':
					newInline.push(kv);
					break;
				case 'QUERY_STRING':
					newQueryString.push(kv);
					break;
			}
		});
		requestService.headers = newHeaders;
		requestService.body = newBody;
		requestService.inline = newInline;
		requestService.queryString = newQueryString;
	};

	// Function to find a KeyValue object in the RequestService object based on its type and keyName from the INPUT
	const findRequestKeyValue = (type: VariableTypeString, keyName: string): KeyValue | undefined => {
		let targetArray: KeyValue[] | undefined;
		switch (type) {
			case 'HEADER':
				targetArray = requestService.headers;
				break;
			case 'BODY':
				targetArray = requestService.body;
				break;
			case 'INLINE_PARAM':
				targetArray = requestService.inline;
				break;
			case 'QUERY_STRING':
				targetArray = requestService.queryString;
				break;
		}
		return targetArray?.find((kv) => kv.key === keyName);
	};

	// Moves forward in the phase flow based on filters and current page
	const handlePhaseChangeForward = () => {
		disabledBackwards = false;
		disabledForward = false;

		if (phase[phaseIndex] === 'variables') {
			if (endpoint.filters.length === 0) {
				phaseIndex = 2;
			} else if (requestService.filters.length > 0) {
				phaseIndex = 2;
			} else {
				phaseIndex = 1;
			}
		} else if (phase[phaseIndex] === 'initialFilters') {
			phaseIndex = 2;
		}

		if (phaseIndex === phase.length - 1) {
			disabledForward = true;
		}
	};

	// Moves back in the flow or exits to home
	const handlePhaseChangeBackward = () => {
		if (phase[phaseIndex] === 'variables') {
			goto('/');
		} else if (phase[phaseIndex] === 'initialFilters') {
			phaseIndex = 0;
		} else if (phase[phaseIndex] === 'results') {
			phaseIndex = 0;
		} else if (phase[phaseIndex] === 'filters') {
			phaseIndex = 2;
		}

		disabledBackwards = phaseIndex === 0;
		disabledForward = phaseIndex === phase.length - 1;
	};

	// Fetches endpoint data and initializes requestService
	// If filters exist, checks for user-filters and sets them
	const fetchEndpoint = async (id: number) => {
		try {
			endpoint = await api.getServiceById(id);

			const result = handleInitializeRequestService(endpoint.variables);
			requestService.headers = result.headers;
			requestService.body = result.body;
			requestService.inline = result.inline;
			requestService.queryString = result.queryString;

			if (endpoint.filters.length === 0) {
				await executeEndpoint();
				phaseIndex = 2;
				return;
			}

			const userFilters = await api.getUserFilters(id);
			hasUserFilters = userFilters.userFilters.length > 0;

			if (userFilters.userFilters.length === 0) {
				selectedFilterIds = endpoint.filters.map((f) => f.responsePatternId);
			} else {
				selectedFilterIds = userFilters.userFilters.map((f) => f.responsePatternId);
				requestService.filters = userFilters.userFilters
					.map((f) => {
						const fullFilter = endpoint.filters.find(
							(e) => e.responsePatternId === f.responsePatternId
						);
						if (!fullFilter) return null;
						return { key: fullFilter.name, value: String(f.responsePatternId) };
					})
					.filter(Boolean) as KeyValue[];

				phaseIndex = 0;
			}
		} catch (error) {
			console.log(error);
		}
	};

	// Executes the endpoint using requestService
	// If filters are present, they are applied to the request
	const executeEndpoint = async () => {
		try {
			ExecutionResponse = await api.executeService(data.id, requestService);
			// ExecutionResponse = mockExecutionResponse;
		} catch (error) {
			console.log(error);
			//add alert when component is pushed
		}
	};

	// This is a mock function to simulate the fetchEndpoint function if no backend available
	/*
	const fetchEndpoint = async ( id:number ) => {
		endpoint = {
			id: id,
			name: "Get PNA by SKU",
			description: "This endpoint retrieves the PNA by SKU.",
			active: true,
			method: 'GET',
			url: 'https:blabla',
			responses: [{
				status: 20,
				description: 'OK',
			}
			],
			filters: [],
			variables: [
				{requestVariableId: 1,
				type: 'HEADER',
				keyName: 'CLIENT ID',
				defaultValue: '',
				customizable: true,
				description: 'The id of the client'},
				{requestVariableId: 2,
					type: 'BODY',
					keyName: 'SKU',
					defaultValue: '00000',
					customizable: true,
					description: 'The SKU of the product'}
			],
			requestBody: 'Template'
		};

		initializeRequestService(endpoint.variables);
	}
	*/
	// Sends the request and moves to the results page
	// Saves selected filters if on the initialFilters page
	const handleSend = async () => {
		try {
			if (phase[phaseIndex] === 'initialFilters') {
				await api.createUserFilters(endpoint.id, {
					endpointId: endpoint.id,
					responsePatternIds: selectedFilterIds
				});

				requestService.filters = selectedFilterIds
					.map((id) => {
						const fullFilter = endpoint.filters.find((f) => f.responsePatternId === id);
						if (!fullFilter) return null;
						return { key: fullFilter.name, value: String(id) };
					})
					.filter(Boolean) as KeyValue[];

				await executeEndpoint();
				phaseIndex = 2;
			} else {
				await executeEndpoint();
				phaseIndex = 2;
			}

			disabledForward = true;
			disabledBackwards = false;
		} catch (error) {
			console.log('Error in handleSend:', error);
		}
	};

	// Updates selected filters, applies them to the request, and persists to backend
	const handleFilterChange = async (selectedIds: number[]) => {
		selectedFilterIds = selectedIds;

		// Build filter key-value pairs for the current request
		requestService.filters = selectedFilterIds
			.map((id) => {
				const fullFilter = endpoint.filters.find((f) => f.responsePatternId === id);
				if (!fullFilter) return null;
				return { key: fullFilter.name, value: String(id) };
			})
			.filter(Boolean) as KeyValue[];

		// Save updated filters to backend
		try {
			await api.createUserFilters(endpoint.id, {
				endpointId: endpoint.id,
				responsePatternIds: selectedFilterIds
			});
		} catch (err) {
			console.error('Failed to save updated filters:', err);
		}
	};

	fetchEndpoint(data.id);
</script>

<main class="space-y-10 p-10">
	{#if phase[phaseIndex] === 'results'}
		<DisplayResultSectionInvokeService
			{ExecutionResponse}
			filters={requestService.filters}
			on:openFilters={() => {
				selectedFilterIds = endpoint.filters
					.filter((f) => requestService.filters.some((rf) => rf.key === f.name))
					.map((f) => f.responsePatternId);

				phaseIndex = 3;
			}}
		/>
	{:else if phase[phaseIndex] == 'variables'}
		<ParameterSectionInvokeService
			{endpoint}
			{variableTypes}
			{variableTypeHeadingMap}
			{findRequestKeyValue}
		/>
	{:else if phase[phaseIndex] == 'initialFilters'}
		<FilterSectionInvokeService
			filters={endpoint.filters}
			selected={selectedFilterIds}
			on:filterChange={(e) => handleFilterChange(e.detail)}
		/>
	{:else if phase[phaseIndex] == 'filters'}
		<FilterSectionInvokeService
			filters={endpoint.filters}
			selected={selectedFilterIds}
			on:filterChange={(e) => handleFilterChange(e.detail)}
		/>
	{:else}
		<p>Nothing</p>
	{/if}

	<div class="flex w-full items-center justify-between">
		<div>
			<Button type="button" size="md" variant="secondary" onClick={handlePhaseChangeBackward}>
				Return
			</Button>
		</div>
		<div>
			{#if phase[phaseIndex] === 'initialFilters'}
				<Button variant="primary" type="submit" size="md" onClick={handleSend}>Send</Button>
			{:else if phase[phaseIndex] === 'variables'}
				{#if endpoint.filters.length > 0}
					{#if hasUserFilters}
						<Button variant="primary" type="submit" size="md" onClick={handleSend}>Send</Button>
					{:else if selectedFilterIds.length === endpoint.filters.length}
						<Button variant="primary" type="button" size="md" onClick={handlePhaseChangeForward}
							>Next</Button
						>
					{:else}
						<Button variant="primary" type="submit" size="md" onClick={handleSend}>Send</Button>
					{/if}
				{:else}
					<Button variant="primary" type="submit" size="md" onClick={handleSend}>Send</Button>
				{/if}
			{/if}
		{/each}
	</div>

	<!-- Send Button -->
	<Button variant="primary" type="submit" size="lg" onClick={handleSend}>Send</Button>

	<!-- Response Section -->
	<div class="space-y-4">
		{#if ExecutionResponse.status.code}
			<HeadingFormat as="h3"
				>Response
				<Tooltip value={ExecutionResponse.status.description}
					>(Status code: {ExecutionResponse.status.code})</Tooltip
				>
			</HeadingFormat>

			<List type="ul">
				{#each ExecutionResponse.response as variableResponse, index (index)}
					{#each Object.entries(variableResponse) as [key, value], innerIndex (innerIndex)}
						<li><b>{key}:</b> {value.join(', ')}</li>
					{/each}
				{/each}
			</List>

			<HeadingFormat as="h4">Raw body</HeadingFormat>
			<TextArea
				disabled={true}
				text={ExecutionResponse.response ? JSON.stringify(ExecutionResponse.response) : ''}
			/>
		{/if}
	</div>
</main>
