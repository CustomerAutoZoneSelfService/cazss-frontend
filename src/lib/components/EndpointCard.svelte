<script lang="ts">
	export let id: number;
	export let title: string;
	export let description: string;
	export let starred: boolean = false;
	export let historyCard: boolean = false;
	let toggleStarred = () => {
		starred = !starred;
	};
</script>

<!-- Agregamos `group` acá -->
<div class="group bg-gray-light hover:bg-accent-red relative h-40 rounded-3xl shadow-lg">
	<a href="/endpoint/{id}">
		<div class="h-full w-full rounded-3xl p-6">
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
	</a>
	{#if historyCard}
		<div class="absolute top-5 right-5">
			<span class="text-near-black text-xs font-bold group-hover:text-white">History</span>
		</div>
	{:else}
		<button
			class="text-near-black hover:bg-accent-red-dark absolute right-5 bottom-5 flex h-7 w-7 items-center justify-center rounded-full group-hover:text-white"
			on:click|stopPropagation={toggleStarred}
		>
			{starred ? '★' : '☆'}
		</button>
	{/if}
</div>
