<script lang="ts">
	import * as lucide from 'lucide-svelte';
	import { type IconList } from '$lib/types/IconList';

	let {
		name,
		size = 32,
		color = '#000000'
	}: {
		name: IconList;
		size?: number;
		color?: string;
	} = $props();
	const Icon = lucide[name];
</script>

<div>
	<Icon {size} {color} class="text-inherit" />
</div>
