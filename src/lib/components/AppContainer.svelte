<script lang="ts">
	import { setContext } from 'svelte';
	import ApiWrapper from '$lib/ApiWrapper';
	import { replaceWithMock } from '$lib/mockApiWrapper';

	const api = new ApiWrapper();
	let useMock = true;

	console.log(window.E2E_MOCKED);
	if (window.E2E_MOCKED != undefined) {
		useMock = window.E2E_MOCKED === true;
	}

	if (useMock) {
		replaceWithMock(api);
	}

	setContext('api', api);

	let { children } = $props();
</script>

<div class="flex h-screen w-screen overflow-hidden">
	{@render children()}
</div>
