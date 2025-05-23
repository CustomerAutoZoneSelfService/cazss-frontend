<script lang="ts">
	import HeadingFormat from '$lib/components/HeadingFormat.svelte';
	import TextFormat from '$lib/components/TextFormat.svelte';
	import CheckBox from '$lib/components/CheckBox.svelte';
	import { createEventDispatcher } from 'svelte';
	import type { Filter } from '$lib/types/Filter';

	const { filters, selected }: { filters: Filter[]; selected: number[] } = $props();
	const selectedFilters = new Set<number>(selected);
	const dispatch = createEventDispatcher();

	function toggleFilter(id: number) {
		if (selectedFilters.has(id)) {
			selectedFilters.delete(id);
		} else {
			selectedFilters.add(id);
		}

		dispatch('filterChange', Array.from(selectedFilters));
	}

	function isChecked(id: number) {
		return selectedFilters.has(id);
	}
</script>

<main class="flex flex-col gap-6 flex-1">
	<div>
		<HeadingFormat variant="primary">Edit filters</HeadingFormat>
		<TextFormat size="body">
			Refine the criteria that determine which products appear in your list.
		</TextFormat>
	</div>

	<div class="flex flex-col gap-4 mt-6">
		{#each filters as filter (filter.responsePatternId)}
			<label class="flex items-start gap-3 cursor-pointer">
				<CheckBox
					checked={isChecked(filter.responsePatternId)}
					on:click={() => toggleFilter(filter.responsePatternId)}
				/>
				<div>
					<TextFormat as="span" variant="primary" size="subtitle">{filter.name}</TextFormat>
					<TextFormat as="p" size="body">{filter.description}</TextFormat>
				</div>
			</label>
		{/each}
	</div>
</main>
