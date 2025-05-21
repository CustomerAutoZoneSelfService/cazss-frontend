<script lang="ts">
	/*
	 * Endpoint Page
	 *
	 * This page is responsible for allowing the user to input their request variables for the endpoint (in case they exist)
	 * and allowing him to send it.
	 */

	import { getContext } from 'svelte';

	import Button from '$lib/components/Button.svelte';
	import HeadingFormat from '$lib/components/HeadingFormat.svelte';
	import TextArea from '$lib/components/TextArea.svelte';
	import TextFormat from '$lib/components/TextFormat.svelte';
	import Input from '$lib/components/Input.svelte';
	import Tooltip from '$lib/components/Tooltip.svelte';

	import type { Params } from './+page';
	import type { DetailedService, KeyValue } from '$lib/types/ApiWrapper';
	import type { RequestVariableString, VariableTypeString } from '$lib/types/RequestVariable';
	import type { RequestService } from '$lib/types/RequestService';
	import type { ServiceResponse } from '$lib/types/ServiceResponse';
	import type ApiWrapper from '$lib/ApiWrapper';

	import List from '$lib/components/List.svelte';
	import PdfViewer from '$lib/components/PdfViewer.svelte';
	
	let api: ApiWrapper = getContext('api');

	let { data }: { data: Params['params'] } = $props();
	console.log('accessed to endpoint page');

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

	// Function to initialize the RequestService object with the variables from the endpoint and possible default values
	const initializeRequestService = (variables: RequestVariableString[]) => {
		const newHeaders: KeyValue[] = [];
		const newBody: KeyValue[] = [];
		const newInline: KeyValue[] = [];
		const newQueryString: KeyValue[] = [];

		variables.forEach((variable) => {
			const kv: KeyValue = { key: variable.keyName, value: variable.defaultValue ?? '' };
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

	const fetchEndpoint = async (id: number) => {
		try {
			endpoint = await api.getServiceById(id);
			initializeRequestService(endpoint.variables);
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
			await executeEndpoint();
			console.log('Sending endpoint');
			console.log(requestService);
		} catch (error) {
			if (error) {
				console.log(`There was an error with the request for the endpoint: ${data.id}`);
				//add alert when component is pushed
			}
		}
	};

	fetchEndpoint(data.id);
</script>

<main class="space-y-10 p-10">
	<!-- Header section -->
	<div class="flex flex-col gap-6">
		<HeadingFormat>
			{endpoint.name}
		</HeadingFormat>
		<TextFormat size="body" variant="primary">{endpoint.description}</TextFormat>
	</div>

	<!-- Request variables input section -->
	<div class="flex flex-col gap-4">
		<!-- Variables Section -->
		{#each variableTypes as variables, index (index)}
			{#if variables.length > 0}
				<div class="flex flex-col gap-4">
					<HeadingFormat as="h4">{variableTypeHeadingMap.get(variables[0].type)}</HeadingFormat>
					<div class="flex flex-col">
						{#each variables as variable (variable.keyName)}
							{@const requestValue = findRequestKeyValue(variable.type, variable.keyName)}
							<div class="flex items-center gap-4">
								<div class="flex flex-row gap-2">
									<TextFormat as="label" size="body" className="whitespace-nowrap">
										{variable.keyName}
									</TextFormat>

									{#if variable.description}
										<Tooltip value={variable.description}>
											<span class="cursor-pointer text-red-500">(?)</span>
										</Tooltip>
									{/if}
								</div>

								<div>
									{#if !variable.customizable}
										<Input boxSize="full" isDisabled={true} bind:text={variable.defaultValue} />
									{:else if requestValue}
										<Input
											boxSize="full"
											isDisabled={!variable.customizable}
											bind:text={requestValue.value}
										/>
									{/if}
								</div>
							</div>
						{/each}
					</div>
				</div>
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
			{#if ExecutionResponse.response.some((variable) => 'content' in variable)}
				
				<PdfViewer data={`data:application/pdf;base64,` + ExecutionResponse.response.find(v => 'content' in v)?.content[0]} />
				
			{:else}
				<TextArea
					disabled={true}
					text={ExecutionResponse.response ? JSON.stringify(ExecutionResponse.response) : ''}
				/>
			{/if}
		{/if}
	</div>
</main>
