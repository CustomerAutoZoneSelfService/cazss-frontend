<script lang="ts">
    import HeadingFormat from '$lib/components/HeadingFormat.svelte';
    import TextFormat from '$lib/components/TextFormat.svelte';
    import Input from '$lib/components/Input.svelte';
    import Tooltip from '$lib/components/Tooltip.svelte';
    import Button from '$lib/components/Button.svelte';
    import type { DetailedService, KeyValue } from '$lib/types/ApiWrapper';
    import type { RequestVariableString, VariableTypeString  } from '$lib/types/RequestVariable';

    export let endpoint: DetailedService;
    export let variableTypes: RequestVariableString[][];
    export let variableTypeHeadingMap: Map<string, string>;
    export let findRequestKeyValue: (type: VariableTypeString, keyName: string) => KeyValue | undefined
</script>

<main>
	<!-- Header section -->
	<div class="flex flex-col gap-6">
		<HeadingFormat>
			{endpoint.name}
		</HeadingFormat>
		<TextFormat size="body" variant="primary">{endpoint.description}</TextFormat>
	</div>

	<!-- Request variables input section -->
	<div class="flex flex-col gap-4">
		<!-- Variables Section -->
		{#each variableTypes as variables, index (index)}
			{#if variables.length > 0}
				<div class="flex flex-col gap-4">
					<HeadingFormat as="h4">{variableTypeHeadingMap.get(variables[0].type)}</HeadingFormat>
					<div class="flex flex-col">
						{#each variables as variable (variable.keyName)}
							{@const requestValue = findRequestKeyValue(variable.type, variable.keyName)}
							<div class="flex items-center gap-4">
								<div class="flex flex-row gap-2">
									<TextFormat as="label" size="body" className="whitespace-nowrap">
										{variable.keyName}
									</TextFormat>

									{#if variable.description}
										<Tooltip value={variable.description}>
											<span class="cursor-pointer text-red-500">(?)</span>
										</Tooltip>
									{/if}
								</div>

								<div>
									{#if !variable.customizable}
										<Input boxSize="full" isDisabled={true} bind:text={variable.defaultValue} />
									{:else if requestValue}
										<Input
											boxSize="full"
											isDisabled={!variable.customizable}
											bind:text={requestValue.value}
										/>
									{/if}
								</div>
							</div>
						{/each}
					</div>
				</div>
			{/if}
		{/each}
	</div>

	<!--
        <Button variant="primary" type="submit" size="md" onClick={handleSend} >Send</Button>
    --> 
	
</main>
