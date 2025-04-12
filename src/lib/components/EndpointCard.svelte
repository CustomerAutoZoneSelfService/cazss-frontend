<script lang="ts">
	export let title: string;
	export let description: string;
	export let starred: boolean;
</script>

<div class="bg-gray-light relative h-35 w-70 rounded-3xl p-6 shadow-lg">
	<div
		class="text-near-black text-2xl font-bold"
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
		class="text-near-black mt-2 text-base"
		style="
        display: -webkit-box;
        -webkit-line-clamp: 3;
        -webkit-box-orient: vertical;
        overflow: hidden;
        text-overflow: ellipsis;"
	>
		{description}
	</p>

	<!-- TO DO: replace img with icons -->
	<p
		class="text-near-black absolute right-5 bottom-5 flex h-7 w-7 items-center justify-center rounded-full"
	>
		{starred ? '★' : '☆'}
	</p>
</div>
