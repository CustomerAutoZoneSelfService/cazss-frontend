<script lang="ts">
	import AppContainer from '$lib/components/AppContainer.svelte';
	import Sidebar from '$lib/components/Sidebar.svelte';
	import '../app.css';

	let { children } = $props();
</script>

<AppContainer>
	<Sidebar />
	<div class="grow overflow-y-auto p-8">
		{@render children()}
	</div>
</AppContainer>
