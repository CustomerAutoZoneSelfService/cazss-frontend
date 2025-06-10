<script lang="ts">
	let { data }: { data: string | undefined } = $props();
</script>

<div
	class="mx-auto w-full max-w-[1000px] overflow-hidden rounded-lg border border-gray-300 shadow-md"
>
	<iframe class="h-[800px] w-full border-none" src={data} title="PDF Viewer"></iframe>
</div>
