<script>
  export let checked = false;
  export let disabled = false;
</script>

<input
  type="checkbox"
  class="size-5"
  bind:checked
  disabled={disabled}
  on:click
/>