<script lang="ts">
	/**
	 * History Page
	 * Displays the history of actions taken by the user
	 */
	import type { Params } from './+page';
	import Button from '$lib/components/Button.svelte';
	import { goto } from '$app/navigation';

	let { data }: { data: Params['params'] } = $props();
	const { range } = data;
	console.log('accessed to endpoint page');
</script>

<div class="align-items justify-center">
	<div class="mb-6 flex items-center">
		<div>
			<!--TODO: Make that when going back, the pages goes to the section that the user click the see more and that is displayed well-->
			<Button variant="text" size="sm" on:click={() => goto(`/history#${range}`)}>
				Back (put arrow icon here)
			</Button>
		</div>
		<div>
			<h1 class="text-2xl font-bold">History</h1>
		</div>
	</div>
	<h1>History page for: {range}</h1>

	{#if range === 'today'}
		<p>Mostrando cosas de **hoy**</p>
	{:else if range === 'yesterday'}
		<p>Mostrando cosas de **ayer**</p>
	{:else if range === 'week'}
		<p>Mostrando cosas de **los últimos 7 días**</p>
	{:else}
		<p>Mostrando todo el historial</p>
	{/if}
</div>
