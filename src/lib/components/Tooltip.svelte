<script>
	export let value = '';
</script>

<span class="group relative cursor-pointer">
	<slot />
	<span
		class="absolute top-full left-1/2 z-10 mt-2 w-max -translate-x-1/2 rounded bg-black px-2 py-1 text-xs whitespace-nowrap text-white opacity-0 transition-opacity group-hover:opacity-100"
	>
		{value}
	</span>
</span>
