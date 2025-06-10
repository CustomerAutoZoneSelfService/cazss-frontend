<script lang="ts">
	import HeadingFormat from '$lib/components/HeadingFormat.svelte';
	import TextFormat from '$lib/components/TextFormat.svelte';
	import CheckBox from '$lib/components/CheckBox.svelte';
	import { createEventDispatcher } from 'svelte';
	import type { Filter } from '$lib/types/Filter';

	const { filters, selected }: { filters: Filter[]; selected: number[] } = $props();
	const selectedFilters = new Set<number>(selected);
	const dispatch = createEventDispatcher();

	function toggleFilter(id: number, event: Event) {
		if (selectedFilters.has(id)) {
			if (selectedFilters.size === 1) {
				event.preventDefault();
				alert('At least one filter must be selected.');
			} else {
				selectedFilters.delete(id);
			}
		} else {
			selectedFilters.add(id);
		}

		dispatch('filterChange', Array.from(selectedFilters));
	}

	function isChecked(id: number) {
		return selectedFilters.has(id);
	}
</script>

<main>
	<div>
		<HeadingFormat variant="primary">Edit filters</HeadingFormat>
		<TextFormat size="body">
			Refine the criteria that determine which products appear in your list.
		</TextFormat>
	</div>

	<div class="mt-6 ml-7 flex flex-col gap-4">
		{#each filters as filter (filter.responsePatternId)}
			<div>
				<div class="inline-flex items-center gap-2">
					<CheckBox
						checked={isChecked(filter.responsePatternId)}
						on:click={(event: Event) => toggleFilter(filter.responsePatternId, event)}
					/>
					<h1 class="text-lg font-bold text-gray-900">
						{filter.name}
					</h1>
				</div>
				<div class="text-md text-gray-500">{filter.description}</div>
			</div>
		{/each}
	</div>
</main>
