<script lang="ts">
	import { getContext } from 'svelte';
	import { goto } from '$app/navigation';

	import type { Params } from './+page';
	import type { DetailedService, KeyValue } from '$lib/types/ApiWrapper';
	import type { RequestVariableString, VariableTypeString } from '$lib/types/RequestVariable';
	import type { RequestService } from '$lib/types/RequestService';
	import type { ServiceResponse } from '$lib/types/ServiceResponse';
	import type ApiWrapper from '$lib/ApiWrapper';
	import ParameterSectionInvokeService from '$lib/components/ParameterSectionInvokeService.svelte';
	import DisplayResultSectionInvokeService from '$lib/components/DisplayResultSectionInvokeService.svelte';
	import { handleInitializeRequestService } from '$lib/handlers/handleInitializeRequestService';
	import Button from '$lib/components/Button.svelte';
	import FilterSectionInvokeService from '$lib/components/FilterSectionInvokeService.svelte';

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
		queryString: [],
		filters: []
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
			selectedFilterIds = endpoint.filters.map(f => f.responsePatternId);
		} else {
			selectedFilterIds = userFilters.userFilters.map(f => f.responsePatternId);
			requestService.filters = userFilters.userFilters
			.map(f => {
				const fullFilter = endpoint.filters.find(e => e.responsePatternId === f.responsePatternId);
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
				.map(id => {
					const fullFilter = endpoint.filters.find(f => f.responsePatternId === id);
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
	
	// Updates selected filters and applies them to the request
	const handleFilterChange = (selectedIds: number[]) => {
		selectedFilterIds = selectedIds;

		requestService.filters = selectedFilterIds
		
			.map(id => {
				const fullFilter = endpoint.filters.find(f => f.responsePatternId === id);
				if (!fullFilter) return null;
				return { key: fullFilter.name, value: '' };
			})
			.filter(Boolean) as KeyValue[];
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
				.filter(f => requestService.filters.some(rf => rf.key === f.name))
				.map(f => f.responsePatternId);

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
			<Button
				type="button"
				size="md"
				variant="secondary"
				onClick={handlePhaseChangeBackward}
			>
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
						<Button variant="primary" type="button" size="md" onClick={handlePhaseChangeForward}>Next</Button>
					{:else}
						<Button variant="primary" type="submit" size="md" onClick={handleSend}>Send</Button>
					{/if}
				{:else}
					<Button variant="primary" type="submit" size="md" onClick={handleSend}>Send</Button>
				{/if}
			{/if}
		</div>
	</div>
</main>
