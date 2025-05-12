<script lang="ts">
	import UsernameButton from '$lib/components/UsernameButton.svelte';

	let isSidebarCollapsed = false;
</script>

<div class="absolute bottom-5">
	<UsernameButton {isSidebarCollapsed} />
</div>
