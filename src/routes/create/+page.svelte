<script lang="ts">
	//import HeadingFormat from '$lib/components/HeadingFormat.svelte';

	import { goto } from '$app/navigation';
	// import { VariableType } from '$lib/types/RequestVariable';
	// import type { InputTablePrompt } from '$lib/types/InputTablePrompt';
	// import type { Endpoint } from '$lib/types/Endpoint';
	import EndpointForm from '$lib/components/EndpointForm.svelte';
	// import type { DetailedService } from '$lib/types/ApiWrapper';
	// import type { RequestVariable } from '$lib/types/RequestVariable';
	// import type { ResponseStatusEntry } from '$lib/types/ResponseStatusEntry';
	// import type { VariableTypeString } from '$lib/types/RequestVariable';
	// import type { ResponsePattern } from '$lib/types/ResponsePattern';
	import type { PayloadCreate } from '$lib/types/PayloadCreate';

	let endpointForm: EndpointForm | undefined = $state();

	export function registerEndpoint() {
		let payload: PayloadCreate = {
			endpoint: endpointForm?.getDetailedService(),
			requestVariables: endpointForm?.getRequestVariables(),
			status: endpointForm?.getStatusCodes()
		};

		//Llamar a la API para registrar el endpoint

		console.log('Payload Final:', payload);

		goto('/');
	}
</script>

<EndpointForm onSubmit={() => registerEndpoint()} bind:this={endpointForm} />
