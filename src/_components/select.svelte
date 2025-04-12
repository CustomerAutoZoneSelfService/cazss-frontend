<script lang='ts'>
    export let options: Array<{ value: number; label: string }> = [];
    export let selected: string = '';
    export let disabled: boolean = false;
  </script>
  
  <div class="relative w-48">
    <select class="appearance-none w-full bg-[#EBEBEB] text-black rounded-2xl py-1 px-4 pr-10 shadow-xl" bind:value={selected}>
      {#if !disabled}
        {#each options as option}
          <option value={option.value}>{option.label}</option>
        {/each}
      {/if}
    </select>
  
    <div class="pointer-events-none absolute inset-y-0 right-3 flex items-center">
      <div class="w-2 h-0 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-[#B7B5B5]"></div>
    </div>
  </div>