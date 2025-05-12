<script lang="ts">
	export let text: string = '';
	export let placeholder: string = '';
	export let disabled: boolean = false;

	// New props
	export let useMonospace: boolean = false;
	export let transparentBackground: boolean = false;
	export let margin: boolean = false;
	export let marginSize: string = '1rem';
</script>

<textarea
	class={`h-50 w-full resize-none rounded-2xl p-5 shadow-md shadow-gray-300
	  ${useMonospace ? 'font-mono' : ''}
	  ${transparentBackground ? 'bg-transparent' : 'bg-gray-light'}
	`}
	style={margin ? `margin: ${marginSize};` : ''}
	bind:value={text}
	{disabled}
	{placeholder}
></textarea>
