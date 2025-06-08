<script lang="ts">
	export let code: number;

	// Determine badge color class based on status code
	$: colorClass =
		code >= 200 && code < 300
			? 'bg-green-500'
			: code >= 400 && code < 500
				? 'bg-red-500'
				: code >= 500
					? 'bg-yellow-500'
					: 'bg-gray-400';
</script>

<span class={`rounded-full px-2 py-0.5 text-sm font-medium text-white ${colorClass}`}>
	{code}
</span>
