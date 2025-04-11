<script lang="ts">
    export let className: string = '';
    export let listStyle:'list-decimal' | 'list-disc' = 'list-decimal';
    export let direction: 'vertical' | 'horizontal' = 'vertical';
    export let type: 'ul' | 'ol' = 'ul';
  
    const isHorizontal = direction === 'horizontal';
  
    const baseStyles = isHorizontal
      ? 'flex gap-8 p-2'
      : 'flex flex-col gap-6 p-2';
  
  </script>
  
  {#if type === 'ul'}
    <ul class={`${baseStyles} ${listStyle} ${className}`}>
      <slot />
    </ul>
  {:else}
    <ol class={`${baseStyles} ${listStyle} ${className}`}>
      <slot />
    </ol>
  {/if}