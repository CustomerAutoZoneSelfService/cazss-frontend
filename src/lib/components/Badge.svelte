<script lang="ts">
	export let code: number;

	// Determine badge color class based on status code range
	$: colorClass =
		code >= 100 && code < 200
			? 'bg-blue-400' // Informational
			: code >= 200 && code < 300
				? 'bg-green-500' // Success
				: code >= 300 && code < 400
					? 'bg-yellow-400' // Redirection
					: code >= 400 && code < 500
						? 'bg-rose-500' // Client error
						: code >= 500 && code < 600
							? 'bg-red-700' // Server error
							: 'bg-gray-400'; // Unknown
</script>

<span class={`rounded-full px-2 py-0.5 text-sm font-medium text-white ${colorClass}`}>
	{code}
</span>
