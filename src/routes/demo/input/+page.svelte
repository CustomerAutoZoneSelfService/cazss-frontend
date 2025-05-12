<script lang="ts">
	import Input from '$lib/components/Input.svelte';

	let isInputDisabled = $state(false);

	let endpointTitleText: string = $state(''),
		urlText: string = $state(''),
		skuText: string = $state('');

	function printText() {
		console.log(endpointTitleText + ' ' + urlText + ' ' + skuText);
	}

	function toggleInputDisable() {
		isInputDisabled = !isInputDisabled;
		console.log(isInputDisabled);
	}
</script>

<div class="ml-10 w-5xl">
	<Input
		name="SomeName"
		bind:text={endpointTitleText}
		placeholder="Type here..."
		boxSize="sm"
		handleInput={printText}
	/>
	<br />
	<Input bind:text={urlText} placeholder="Or here..." boxSize="md" handleChange={printText} />
	<br />
	<Input
		bind:text={skuText}
		placeholder="Can't type here, though..."
		boxSize="full"
		isDisabled={isInputDisabled}
	/>
</div>
<br />
<button onclick={printText}
	>The following text is being accessed from the parent: {endpointTitleText}, {urlText}, {skuText}
</button>
<button onclick={toggleInputDisable}>Click me to enable/disable the third input</button>
