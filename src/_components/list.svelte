<script lang="ts">
  export let className: string = '';
  export let direction: 'vertical' | 'horizontal' = 'vertical';
  export let type: 'ul' | 'ol' = 'ul';

  const isHorizontal = direction === 'horizontal';

  const baseStyles = isHorizontal
    ? 'flex gap-8 p-2'
    : 'flex flex-col gap-6 p-2';
</script>

{#if type === 'ul'}
  <ul class={`${baseStyles} ${'list-disc'} ${className}`}>
    <slot />
  </ul>
{:else}
  <ol class={`${baseStyles} ${'list-decimal'} ${className}`}>
    <slot />
  </ol>
{/if}
