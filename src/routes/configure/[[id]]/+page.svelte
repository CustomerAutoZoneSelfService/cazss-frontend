<script lang="ts">
	//import HeadingFormat from '$lib/components/HeadingFormat.svelte';
	import type { Params } from './+page';
	import { getContext } from 'svelte';
	import TextArea from '$lib/components/TextArea.svelte';
	import InputTable from '$lib/components/InputTable.svelte';
	import Button from '$lib/components/Button.svelte';
	import Select from '$lib/components/Select.svelte';
	import Input from '$lib/components/Input.svelte';
	import TextFormat from '$lib/components/TextFormat.svelte';
	import CheckBox from '$lib/components/CheckBox.svelte';
	import { goto } from '$app/navigation';
	import type { InputTablePrompt } from '$lib/types/InputTablePrompt';
	import type {
		ConfigureService,
		RequestVariable,
		ResponsePattern
	} from '$lib/types/ConfigureService';
	import type ApiWrapper from '$lib/ApiWrapper';
	import type { Service } from '$lib/types/ApiWrapper';
	import Spinner from '$lib/components/Spinner.svelte';

	let api: ApiWrapper = getContext('api');
	let { data }: { data: Params['params'] } = $props();
	const endpointCreationMode: boolean = data.id ? false : true;
	let endpoint: ConfigureService = $state({
		categoryId: -1,
		active: true,
		name: '',
		description: '',
		method: 'GET',
		url: '',
		authenticationStrategy: 0,

		template: '',
		requestVariables: [],
		responses: []
	});

	//title, description, url
	let titleAlert = $state(false);
	let urlAlert = $state(false);

	let isPageLoading = $state(false);

	if (!endpointCreationMode) {
		console.log('Edit mode');
		fetchEndpoint(data.id!);
	} else {
		console.log('Create mode');
	}
	// async function getCategories() {
	// 	try {
	// 		const apiCategories = await api.getCategories();
	// 		// Suponiendo que cada categoría tiene un id y un name
	// 		let categories = apiCategories.map((category) => ({
	// 			value: category.id, // o category.categoryId según tu backend
	// 			label: category.name
	// 		}));

	// 		return categories;
	// 	} catch (error) {
	// 		console.error('Error fetching categories:', error);
	// 	}
	// }

	// import { onMount } from 'svelte';

	// onMount(() => {
	// 	getCategories();
	// });

	// let categories = $state<{ value: number; label: string }[]>([]);

	const methodNames = ['GET', 'POST', 'PUT', 'DELETE'];
	const methods = methodNames.map((method) => ({ value: method, label: method }));

	let authNames = ['BEARER_TOKEN_1', 'BEARER_TOKEN_2'];
	let authStrategies = authNames.map((authStrategy, index) => ({
		value: index,
		label: authStrategy
	}));

	let categoryNames = ['INVOICE', 'CACHE'];
	let categories = categoryNames.map((category, index) => ({ value: index, label: category }));

	// let statusCodeNames = ['200', '201', '202', '204', '400', '401', '403', '404', '500'];
	// let statusDescriptions = [
	// 	'OK',
	// 	'Created',
	// 	'Accepted',
	// 	'No Content',
	// 	'Bad Request',
	// 	'Unauthorized',
	// 	'Forbidden',
	// 	'Not Found',
	// 	'Internal Server Error'
	// ];

	let statusCodes = $state<{ value: number; label: string }[]>([]);
	// 	statusCodeNames.map((statusCode) => ({ value: statusCode, label: statusCode }))
	// );

	let newStatusCode = $state('');
	let selectedStatusCode = $state<number | ''>('');
	let selectedResponseDescription = $state<string | undefined>('');

	function addStatusCode() {
		const codeStr = newStatusCode.trim();
		// Validate status code
		if (!/^\d{3}$/.test(codeStr)) {
			alert('Status code must be a 3 digit numeric value');
			return;
		}

		const numericCode = parseInt(codeStr, 10);

		if (isNaN(numericCode)) {
			alert('Invalid status code. Please enter a numeric value.');
			newStatusCode = ''; // Clear the invalid input
			return;
		}
		if (statusCodes.some((sc) => sc.value === numericCode)) {
			alert('The status code already exists');
			return;
		}

		statusCodes.push({ value: numericCode, label: codeStr });
		statusCodes.sort((a, b) => a.value - b.value);
		selectedStatusCode = numericCode;
		newStatusCode = '';
	}

	$effect(() => {
		if (selectedStatusCode !== '' && selectedStatusCode !== null) {
			pushResponseInfo();
		}
	});

	let step = $state(1);

	let headersPrompt: InputTablePrompt = {
		requestVariables: [],
		requestVariableType: 'HEADER'
	};
	let inlineParamPrompt: InputTablePrompt = {
		requestVariables: [],
		requestVariableType: 'INLINE'
	};
	let queryStringPrompt: InputTablePrompt = {
		requestVariables: [],
		requestVariableType: 'QUERY_STRING'
	};
	let bodyVariablesPrompt: InputTablePrompt = {
		requestVariables: [],
		requestVariableType: 'BODY'
	};

	let responsesPatternsPrompt: InputTablePrompt = {
		responsePatterns: []
	};

	let headersTable: InputTable | undefined = $state();
	let inlineParamsTable: InputTable | undefined = $state();
	let queryStringTable: InputTable | undefined = $state();
	let bodyVariablesTable: InputTable | undefined = $state();
	let responsePatternsTable: InputTable | undefined = $state();

	function validateStep1(): boolean {
		if (!endpoint.name || endpoint.name.trim() === '') {
			alert('Title is mandatory');
			titleAlert = true;
			console.log(titleAlert);
			return false;
		}
		if (!endpoint.url || endpoint.url.trim() === '') {
			alert('URL is mandatory');
			urlAlert = true;
			return false;
		}
		// if (!endpoint.categoryId || endpoint.categoryId === -1) {
		// 	alert('A category must be selected');
		// 	return false;
		// }
		if (endpoint.description === '') {
			alert('A description is mandatory');
			return false;
		}
		// Add more functions if needed
		titleAlert = false;
		urlAlert = false;
		return true;
	}

	function goToNextPage() {
		if (step === 2) {
			pullRequestVariablesFromTables();
			pushStatusCodes();
		} else {
			if (step === 1 && !validateStep1()) {
				return;
			}
			pushRequestVariablesIntoTables();
		}
		console.log($state.snapshot(endpoint));

		step++;
	}

	function goToPreviousPage() {
		if (step === 2) pullRequestVariablesFromTables();
		else {
			if (step === 3 && $state.snapshot(selectedStatusCode) != '') saveResponseData();
			pushRequestVariablesIntoTables();
		}
		step--;
	}

	//Get request Variables from InputTables in step 2
	function pullRequestVariablesFromTables() {
		const headersData = headersTable!.getVariables() as RequestVariable[];
		const inlineParamsData = inlineParamsTable!.getVariables() as RequestVariable[];
		const bodyData = bodyVariablesTable!.getVariables() as RequestVariable[];
		const queryStringData = queryStringTable!.getVariables() as RequestVariable[];

		endpoint.requestVariables = [];

		endpoint.requestVariables.push(
			...headersData,
			...inlineParamsData,
			...bodyData,
			...queryStringData
		);
	}

	//When moving into step 2, you need to push the values into the tables again
	//This is because every time the tables are renderized again they reset
	function pushRequestVariablesIntoTables() {
		if (endpoint.requestVariables.length > 0) {
			// Clean the prompts
			//Note: The validations might seem redundant, but TypeScript marks an error if they're missing
			//DON'T REMOVE THE VALIDATIONS!
			if ('requestVariableType' in headersPrompt) headersPrompt.requestVariables = [];
			if ('requestVariableType' in inlineParamPrompt) inlineParamPrompt.requestVariables = [];
			if ('requestVariableType' in queryStringPrompt) queryStringPrompt.requestVariables = [];
			if ('requestVariableType' in bodyVariablesPrompt) bodyVariablesPrompt.requestVariables = [];

			//Insert the saved values into the prompts
			for (const requestVariable of endpoint.requestVariables) {
				switch (requestVariable.type) {
					case 'HEADER':
						if ('requestVariableType' in headersPrompt)
							headersPrompt.requestVariables.push(requestVariable);
						break;
					case 'QUERY_STRING':
						if ('requestVariableType' in queryStringPrompt)
							queryStringPrompt.requestVariables.push(requestVariable);
						break;
					case 'BODY':
						if ('requestVariableType' in bodyVariablesPrompt)
							bodyVariablesPrompt.requestVariables.push(requestVariable);
						break;
					case 'INLINE':
						if ('requestVariableType' in inlineParamPrompt)
							inlineParamPrompt.requestVariables.push(requestVariable);
						break;
				}
			}
		}
	}

	function pushStatusCodes() {
		if (endpoint.responses && endpoint.responses.length > 0) {
			for (const response of endpoint.responses) {
				if (!statusCodes.some((sc) => sc.value === response.statusCode)) {
					statusCodes.push({ value: response.statusCode, label: response.statusCode.toString() });
				}
			}
			statusCodes.sort((a, b) => a.value - b.value);
		}
	}

	//During step 3 you need to change the info depending on the selected status code
	function pushResponseInfo() {
		if (endpoint.responses && endpoint.responses.length > 0) {
			const selectedResponseInfo = $state
				.snapshot(endpoint.responses)
				.find((response) => response.statusCode === $state.snapshot(selectedStatusCode));
			selectedResponseDescription = selectedResponseInfo?.description;
			const responsePatterns = selectedResponseInfo?.patterns ?? [];
			responsePatternsTable?.setNewVariables(responsePatterns);
		}
	}

	function saveResponseData() {
		console.log($state.snapshot(selectedResponseDescription));
		const responsePatternsData = responsePatternsTable?.getVariables() as ResponsePattern[];
		const statusCodeIndex = $state
			.snapshot(endpoint.responses)
			.findIndex((response) => response.statusCode === $state.snapshot(selectedStatusCode));
		if (statusCodeIndex !== -1) {
			endpoint.responses[statusCodeIndex].patterns = responsePatternsData ?? [];
			endpoint.responses[statusCodeIndex].description =
				$state.snapshot(selectedResponseDescription) ?? '';
		} else {
			endpoint.responses.push({
				statusCode: $state.snapshot(selectedStatusCode) as number,
				description: $state.snapshot(selectedResponseDescription) ?? '',
				patterns: responsePatternsData
			});
		}
	}

	async function configureEndpoint() {
		if ($state.snapshot(selectedStatusCode) != '') saveResponseData();
		let operationSucceeded: boolean = false;

		if (endpointCreationMode) {
			operationSucceeded = await createEndpoint($state.snapshot(endpoint));
		} else {
			operationSucceeded = await updateEndpoint(data.id!, $state.snapshot(endpoint));
		}

		if (operationSucceeded) {
			goto('/');
		}
	}
	//Calling the API to create the endpoint
	async function createEndpoint(endpointData: ConfigureService): Promise<boolean> {
		try {
			isPageLoading = true;
			console.log('Endpoint Data:', endpointData);
			endpointData.categoryId = 59;
			endpointData.authenticationStrategy = null;
			const response: Service = await api.createService(endpointData);
			console.log(response);
			alert('Endpoint created successfully');
			isPageLoading = false;
			return true;
		} catch (error) {
			console.log(error);
			alert('There was an error creating the endpoint');
			return false;
		}
	}

	async function updateEndpoint(
		endpointId: number,
		endpointData: ConfigureService
	): Promise<boolean> {
		try {
			isPageLoading = true;
			endpointData.categoryId = 59;
			endpointData.authenticationStrategy = null;
			const response: ConfigureService = await api.updateService(endpointId, endpointData);
			console.log(response);
			isPageLoading = false;
			alert('Endpoint updated successfully');
			return true;
		} catch (error) {
			console.log(error);
			alert('There was an error cupdating the endpoint');
			return false;
		}
	}

	async function fetchEndpoint(endpointId: number) {
		try {
			//Get endpoint info from the database
			const response: ConfigureService = await api.getServiceByIdForEdit(endpointId);
			endpoint = response;
			console.log($state.snapshot(endpoint));
		} catch (error) {
			console.log(error);
		}
	}
</script>

<div class="align-items justify-center">
	{#if isPageLoading}
		<Spinner variant="dots"></Spinner>
	{:else}
		{#if step === 1}
			<main class="flex-1 bg-white p-8">
				<div class="mb-6 flex items-center justify-between">
					<div>
						<h1 class="text-2xl font-bold">
							{#if endpoint.name != ''}
								{endpoint.name}
							{:else if endpointCreationMode}
								New Endpoint
							{:else}
								Edit Endpoint
							{/if}
						</h1>
						<TextFormat as="p" variant="muted">
							{#if endpointCreationMode}
								Create a new endpoint: {endpoint.name}
							{:else}
								Edit an existing endpoint: {endpoint.name}
							{/if}
						</TextFormat>
					</div>
				</div>

				<form class="space-y-6">
					<div class="flex items-center space-x-4">
						<TextFormat as="label" variant="muted" size="subtitle">Title:</TextFormat>
						<Input bind:text={endpoint.name} boxSize="md" isAlert={titleAlert} />
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
							<Input bind:text={endpoint.url} boxSize="full" isAlert={urlAlert} />
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
				<h1 class="text-2xl font-bold">
					{#if endpoint.name != ''}
						{endpoint.name}
					{:else if endpointCreationMode}
						New Endpoint
					{:else}
						Edit Endpoint
					{/if}
				</h1>
				<div class="flex flex-col">
					<div class="py-2">
						<TextFormat as="label" variant="muted" size="subtitle">Headers:</TextFormat>
						<InputTable prompt={headersPrompt} bind:this={headersTable} />
					</div>
					<div class="py-2">
						<TextFormat as="label" variant="muted" size="subtitle">In Line Params:</TextFormat>
						<InputTable prompt={inlineParamPrompt} bind:this={inlineParamsTable} />
					</div>
					<div class="py-2">
						<TextFormat as="label" variant="muted" size="subtitle">Query String:</TextFormat>
						<InputTable prompt={queryStringPrompt} bind:this={queryStringTable} />
					</div>
					<div class="py-2">
						<TextFormat as="label" variant="muted" size="subtitle">Body Template:</TextFormat>
						<TextArea bind:text={endpoint.template} />
					</div>
					<div class="py-2">
						<TextFormat as="label" variant="muted" size="subtitle">Body Variables:</TextFormat>
						<InputTable prompt={bodyVariablesPrompt} bind:this={bodyVariablesTable} />
					</div>
				</div>
			</main>
		{/if}

		{#if step === 3}
			<main class="flex-1 bg-white p-8">
				<h1 class="text-2xl font-bold">
					{#if endpoint.name != ''}
						{endpoint.name}
					{:else if endpointCreationMode}
						New Endpoint
					{:else}
						Edit Endpoint
					{/if}
				</h1>
				<TextFormat as="p" variant="muted"
					>How to handle an endpoint's possible responses</TextFormat
				>
				<!-- Add new status code -->
				<div class="flex items-center gap-2 py-2">
					<TextFormat as="label" variant="muted" size="subtitle">Add New Status:</TextFormat>
					<Input bind:text={newStatusCode} boxSize="sm" placeholder="Enter status code" />
					<Button type="button" size="sm" variant="secondary" onClick={addStatusCode}>Add</Button>
				</div>

				<!-- Select an existing status code -->
				<TextFormat as="p" variant="muted"
					>Select a status code to add a description and response patterns</TextFormat
				>
				<div class="flex items-center gap-2 py-2">
					<TextFormat as="label" variant="muted" size="subtitle">Status Code:</TextFormat>
					<Select options={statusCodes} bind:selected={selectedStatusCode} />
				</div>
				<TextFormat as="p" variant="muted"
					>Save your response patterns and description before changing the status code</TextFormat
				>
				<div class="py-2">
					<TextFormat as="label" variant="muted" size="subtitle">Response Description:</TextFormat>
					<TextArea bind:text={selectedResponseDescription} />
				</div>

				<div class="py-2">
					<TextFormat as="label" variant="muted" size="subtitle">Response Patterns:</TextFormat>
					<InputTable prompt={responsesPatternsPrompt} bind:this={responsePatternsTable} />
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
				<Button type="button" size="md" variant="primary" onClick={saveResponseData}
					>Save Response Information</Button
				>
				<Button type="button" size="md" variant="primary" onClick={configureEndpoint}
					>{endpointCreationMode ? 'Register Endpoint' : 'Update Endpoint'}</Button
				>
			{/if}
		</div>
	{/if}
</div>
