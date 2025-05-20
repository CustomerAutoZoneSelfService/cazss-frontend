<script lang="ts">
  import HeadingFormat from './HeadingFormat.svelte';
  import TextFormat from './TextFormat.svelte';
  import Button from './Button.svelte';

  export let title: string;
  export let titleHighlight: string = '';
  export let description: string = '';
  export let inputs: { label: string; value: string }[] = [];
  export let output: { label: string; value: string }[] = [];
  export let onCallAgain: (() => void) | null = null;
  export let callAgainLabel: string = 'Call again';
</script>

<div class="flex flex-col h-full w-full p-8 gap-6">
  <!-- Title -->
  <div class="flex flex-row items-center justify-between">
    <HeadingFormat as="h2" variant="primary">
      {#if titleHighlight && title.includes(titleHighlight)}
        {@html title.replace(titleHighlight, `<span class='text-[#AF8B2E]'>${titleHighlight}</span>`) }
      {:else}
        {title}
      {/if}
    </HeadingFormat>
  </div>

  <!-- Description -->
  {#if description}
    <TextFormat as="p" size="body" variant="muted" className="mb-2">
      {description}
    </TextFormat>
  {/if}

  <!-- Inputs Box -->
  <div class="rounded-2xl bg-gray-100 shadow-md p-6 flex flex-col gap-2">
    <TextFormat as="div" size="subtitle" variant="primary" className="mb-2">Inputs</TextFormat>
    {#each inputs as input}
      <div class="flex flex-row justify-between items-center mb-1">
        <TextFormat as="span" size="body" variant="muted">{input.label}:</TextFormat>
        <TextFormat as="span" size="body" variant="primary" className="bg-white rounded px-3 py-1 shadow text-right min-w-[6rem]">{input.value}</TextFormat>
      </div>
    {/each}
  </div>

  <!-- Output Box -->
    <!-- TODO: Improve or change as desired @Alejandro Pizarro -->
  <div class="rounded-2xl bg-gray-100 shadow-md p-6 flex flex-col gap-2 min-h-[120px]">
    <TextFormat as="div" size="subtitle" variant="primary" className="mb-2">Output</TextFormat>
    {#if output.length === 0}
      <TextFormat as="span" size="body" variant="muted">No output</TextFormat>
    {:else}
      {#each output as item}
        <div class="flex flex-row justify-between items-center mb-1">
          <TextFormat as="span" size="body" variant="muted">{item.label}:</TextFormat>
          <TextFormat as="span" size="body" variant="primary">{item.value}</TextFormat>
        </div>
      {/each}
    {/if}
  </div>

  <!-- Call again button -->
  <div class="mt-auto flex justify-end">
    <Button size="lg" variant="secondary" onClick={onCallAgain}>
      {callAgainLabel}
    </Button>
  </div>
</div> 