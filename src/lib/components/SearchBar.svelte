<script lang="ts">
	let searchQuery: string = $state('');
	let suggestions: string[] = $state([]);

	let { allData, handleFilter }: { allData: string[]; handleFilter: (allData: string[]) => void } =
		$props();

	function handleInput(event: Event) {
		const target = event.target as HTMLInputElement;
		searchQuery = target.value;

		if (searchQuery.length > 0) {
			suggestions = allData.filter((item) =>
				item.toLowerCase().includes(searchQuery.toLowerCase())
			);
		} else {
			suggestions = allData;
		}

		handleFilter(suggestions);
	}

	/*
	function selectSuggestion(suggestion: string) {
		searchQuery = suggestion;
		suggestions = [];
		dispatch('filter', [suggestion]);
	}
	 */
</script>

<!-- Search input -->
<div
	class="relative flex h-15 w-full overflow-hidden rounded-full border border-gray-300 bg-white shadow-md"
>
	<input
		type="text"
		placeholder="Search..."
		class="flex-1 px-4 py-2 text-gray-800 focus:outline-none"
		bind:value={searchQuery}
		oninput={handleInput}
	/>
</div>
