<script lang="ts">
	import { getContext } from 'svelte';

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
	import Spinner from '$lib/components/Spinner.svelte';

	let api: ApiWrapper = getContext('api');

	let { data }: { data: Params['params'] } = $props();

	const phase: string[] = ['variables', 'filters', 'results'];
	let phaseIndex: number = $state(0);

	let disabledForward: boolean = $state(false);
	let disabledBackwards: boolean = $state(false);
	let selectedFilterIds = $state<number[]>([]);

	let isExecuting = $state(false);

	const emptyEndpoint: DetailedService = {
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
	};

	let endpoint = $state<DetailedService>(emptyEndpoint);

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
		response: {}
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

	const handlePhaseChangeForward = () => {
		disabledBackwards = false;
		disabledForward = false;

		if (phaseIndex !== phase.length - 1) {
			phaseIndex += 1;
		}

		if (phaseIndex === 0) {
			disabledBackwards = true;
		}

		if (phaseIndex === phase.length - 1) {
			disabledForward = true;
		}
	};

	const handlePhaseChangeBackward = () => {
		disabledBackwards = false;
		disabledForward = false;

		if (phaseIndex !== 0) {
			phaseIndex -= 1;
		}

		if (phaseIndex === 0) {
			disabledBackwards = true;
		}

		if (phaseIndex === phase.length - 1) {
			disabledForward = true;
		}
	};

	const fetchEndpoint = async (id: number) => {
		try {
			endpoint = await api.getServiceById(id);
			const result = handleInitializeRequestService(endpoint.variables);

			requestService.headers = result.headers;
			requestService.body = result.body;
			requestService.inline = result.inline;
			requestService.queryString = result.queryString;
		} catch (error) {
			console.log(error);
			//add alert when component is pushed
		}
	};

	const executeEndpoint = async () => {
		try {
			ExecutionResponse = await api.executeService(data.id, requestService);
			// ExecutionResponse = mockExecutionResponse;
		} catch (error) {
			console.log(error);
			//add alert when component is pushed
		}
	};

	const handleSend = async () => {
		try {
			isExecuting = true;
			await executeEndpoint();
			console.log(requestService);
			phaseIndex = 2;
			disabledForward = true;
			disabledBackwards = false;
			isExecuting = false;
		} catch (error) {
			if (error) {
				console.log(`There was an error with the request for the endpoint: ${data.id}`);
				//add alert when component is pushed
			}
		}
	};

	const handleFilterChange = (selectedIds: number[]) => {
		selectedFilterIds = selectedIds;
		requestService.filters = endpoint.filters
			.filter((f) => selectedIds.includes(f.responsePatternId))
			.map((f) => ({ key: f.name, value: '' }));
	};

	fetchEndpoint(data.id);
</script>

<main class="space-y-10 p-10">
	{#if isExecuting}
	<Spinner variant="dots"></Spinner>
	{:else}
		{#if endpoint.name === ''}
			<Spinner variant="dots"></Spinner>
		{:else}
			{#if phase[phaseIndex] === 'results'}
				<DisplayResultSectionInvokeService {ExecutionResponse} />
			{:else if phase[phaseIndex] == 'variables'}
				<ParameterSectionInvokeService
					{endpoint}
					{variableTypes}
					{variableTypeHeadingMap}
					{findRequestKeyValue}
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
						disabled={disabledBackwards}
					>
						Return
					</Button>
				</div>
				<div>
					{#if phase[phaseIndex] === 'filters'}
						<Button variant="primary" type="submit" size="md" onClick={handleSend}>Send</Button>
					{:else if phase[phaseIndex] !== 'results'}
						<Button onClick={handlePhaseChangeForward} disabled={disabledForward}>Next</Button>
					{/if}
				</div>
			</div>
		{/if}
	{/if}
	
</main>
