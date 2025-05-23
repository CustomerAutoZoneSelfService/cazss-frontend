<script lang="ts">
	let {
		//id,
		title,
		description,
		starred = false,
		historyCard = false,
		useDate = '',
		onClick = () => {}
	} = $props<{
		id: number;
		title: string;
		description: string;
		starred?: boolean;
		historyCard?: boolean;
		useDate?: string;
		onClick?: (event: MouseEvent) => void;
	}>();

	let isStarred = $state(starred);

	function toggleStarred(event: MouseEvent) {
		event.stopPropagation();
		isStarred = !isStarred;
	}

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Enter' || event.key === ' ') {
			event.preventDefault(); // Prevent scrolling on Space
			onClick(new MouseEvent('click'));
		}
	}
</script>

<!-- Make the card clickable and accessible -->
<div
	class="group bg-gray-light hover:bg-accent-red relative flex h-fit cursor-pointer flex-col rounded-3xl p-6 shadow-lg"
	onclick={onClick}
	onkeydown={handleKeydown}
	tabindex="0"
	role="button"
>
	<div class="h-full w-full rounded-3xl">
		<div
			class="text-near-black text-2xl font-bold group-hover:text-white"
			style="
			display: -webkit-box;
			-webkit-line-clamp: 2;
			-webkit-box-orient: vertical;
			overflow: hidden;
			text-overflow: ellipsis;"
		>
			{title}
		</div>
		<p
			class="text-near-black mt-2 text-base group-hover:text-white"
			style="
			display: -webkit-box;
			-webkit-line-clamp: 3;
			-webkit-box-orient: vertical;
			overflow: hidden;
			text-overflow: ellipsis;"
		>
			{description}
		</p>
	</div>
	{#if historyCard}
		<div class="ml-auto">
			<span class="text-near-black text-sm group-hover:text-white">{useDate}</span>
		</div>
	{:else}
		<button
			class="text-near-black hover:bg-accent-red-dark ml-auto flex h-7 w-7 items-center justify-center rounded-full group-hover:text-white"
			onclick={toggleStarred}
		>
			{isStarred ? '★' : '☆'}
		</button>
	{/if}
</div>
