<script lang="ts">
	let { children } = $props();
</script>

<div class="flex h-screen w-screen overflow-hidden">
	{@render children()}
</div>
