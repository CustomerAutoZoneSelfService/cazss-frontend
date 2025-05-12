<script lang="ts">
	export let className: string = '';
	export let direction: 'vertical' | 'horizontal' = 'vertical';
	export let type: 'ul' | 'ol' = 'ul';
	export let list = true;

	const baseStyles = direction === 'horizontal' ? 'flex gap-8 p-2' : 'flex flex-col gap-2 p-2';
</script>

{#if type === 'ul'}
	<ul class="{baseStyles} {list ? 'list-disc' : ''} {className}">
		<slot />
	</ul>
{:else}
	<ol class="{baseStyles} {list ? 'list-decimal' : ''} {className}">
		<slot />
	</ol>
{/if}
