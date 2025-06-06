<script lang="ts">
	import { setContext } from 'svelte';
	import { api } from '$lib/ApiWrapper';
	import { replaceWithMock } from '$lib/mockApiWrapper';

	let useMock = false;

	// window
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
