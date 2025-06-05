<script lang="ts">
	import type { InputTablePrompt } from '../types/InputTablePrompt';
	import type { RequestVariable, ResponsePattern } from '$lib/types/ConfigureService';
	import Trash2Icon from 'lucide-svelte/icons/trash-2';

	let { prompt }: { prompt: InputTablePrompt } = $props();

	let variables: RequestVariable[] | ResponsePattern[] = $state(
		'requestVariableType' in prompt
			? (prompt.requestVariables ?? [])
			: (prompt.responsePatterns ?? [])
	);

	export function getVariables() {
		if ('requestVariableType' in prompt) {
			return ($state.snapshot(variables) as RequestVariable[]).filter(
				(variable) => variable.key !== ''
			);
		} else {
			return ($state.snapshot(variables) as ResponsePattern[]).filter(
				(variable) => variable.name !== ''
			);
		}
	}

	export function clearVariables() {
		variables = [];
	}

	export function setNewVariables(newVariables: RequestVariable[] | ResponsePattern[]) {
		if ('key' in newVariables) {
			variables = newVariables as RequestVariable[];
		} else {
			variables = newVariables as ResponsePattern[];
		}
	}

	$effect(() => {
		if (variables.length === 0) {
			addNewRow();
		}
		if (variables.length > 0) {
			const lastItem = variables[variables.length - 1];
			if ('key' in lastItem) {
				if (lastItem.key.length > 0) addNewRow();
			} else {
				if (lastItem.name.length > 0) addNewRow();
			}
		}
	});

	function addNewRow() {
		if ('requestVariableType' in prompt) {
			(variables as RequestVariable[]).push({
				type: prompt.requestVariableType,
				key: '',
				defaultValue: '',
				customizable: false,
				description: ''
			});
		} else {
			(variables as ResponsePattern[]).push({
				parentId: null,
				pattern: '',
				name: '',
				description: '',
				isLeaf: false
			});
		}
	}

	function deleteRow(index: number) {
		if (variables.length > 1) variables.splice(index, 1);
	}

	function onKeyDown(e: KeyboardEvent) {
		let currentInput = document.activeElement;
		let currentTh = currentInput?.parentElement;
		let currentTr = currentTh?.parentElement;
		let index = currentTh && currentTr ? Array.from(currentTr.children).indexOf(currentTh) : null;

		let keyCombinationPressed = e.key + '|' + e.shiftKey + '|' + e.ctrlKey + '|' + e.altKey;
		if (e.altKey) e.preventDefault();

		switch (keyCombinationPressed) {
			case 'ArrowRight|false|false|true':
				currentTh?.nextElementSibling?.getElementsByTagName('input')[0].focus();
				break;
			case 'Enter|true|false|false':
			case 'ArrowUp|false|false|true':
			case 'ArrowUp|false|false|false':
				if (currentTr?.previousElementSibling && index !== null) {
					const prevRowCells = Array.from(currentTr.previousElementSibling.children);
					if (index < prevRowCells.length) {
						const inputElements = prevRowCells[index].getElementsByTagName('input');
						if (inputElements.length > 0) inputElements[0].focus();
					}
				}
				break;
			case 'ArrowLeft|false|false|true':
				currentTh?.previousElementSibling?.getElementsByTagName('input')[0].focus();
				break;
			case 'Enter|false|false|false':
			case 'ArrowDown|false|false|true':
			case 'ArrowDown|false|false|false':
				if (currentTr?.nextElementSibling && index !== null) {
					const nextRowCells = Array.from(currentTr.nextElementSibling.children);
					if (index < nextRowCells.length) {
						const inputElements = nextRowCells[index].getElementsByTagName('input');
						if (inputElements.length > 0) inputElements[0].focus();
					}
				}
				break;
		}
	}

	function generateTestId(rowIndex: number, columnIndex: number) {
		return `cell-row-${rowIndex}-col-${columnIndex}`;
	}
</script>

<table data-testid="variable-table" class="w-full table-auto border-collapse">
	<thead>
		<tr class="bg-gray-100">
			<th class="border border-gray-300 p-2 text-left"
				>{'requestVariableType' in prompt ? 'Key' : 'Name'}</th
			>
			{#if !('requestVariableType' in prompt)}
				<th class="border border-gray-300 p-2 text-left">Parent ID</th>
			{/if}
			<th class="border border-gray-300 p-2 text-left"
				>{'requestVariableType' in prompt ? 'Value' : 'Pattern'}</th
			>
			<th class="border border-gray-300 p-2 text-left whitespace-nowrap"
				>{'requestVariableType' in prompt ? 'Customizable' : 'Is Leaf'}</th
			>
			<th class="w-[300px] border border-gray-300 p-2 text-left">Description</th>
		</tr>
	</thead>
	<tbody>
		{#each variables as variable, index (index)}
			{#if 'key' in variable}
				<tr class="hover:bg-gray-50">
					<th data-testid={generateTestId(index, 0)} class="border border-gray-300 p-2">
						<input onkeydown={onKeyDown} bind:value={variable.key} class="w-full p-1" />
					</th>
					<th data-testid={generateTestId(index, 1)} class="border border-gray-300 p-2">
						<input onkeydown={onKeyDown} bind:value={variable.defaultValue} class="w-full p-1" />
					</th>
					<th data-testid={generateTestId(index, 2)} class="border border-gray-300 p-2 text-center">
						<input type="checkbox" onkeydown={onKeyDown} bind:checked={variable.customizable} />
					</th>
					<th
						data-testid={generateTestId(index, 3)}
						class="group flex w-lg items-center border border-gray-300 p-2"
					>
						<input onkeydown={onKeyDown} bind:value={variable.description} class="w-full p-1" />
						<div
							data-testid={'delete-row-' + index}
							class="invisible ml-2 w-[1.5rem] transition-opacity duration-200 group-hover:visible"
						>
							<button onclick={() => deleteRow(index)}>
								<Trash2Icon class="h-4 w-4 text-red-500 hover:text-red-700" />
							</button>
						</div>
					</th>
				</tr>
			{:else}
				<tr class="hover:bg-gray-50">
					<th data-testid={generateTestId(index, 0)} class="border border-gray-300 p-2">
						<input onkeydown={onKeyDown} bind:value={variable.name} class="w-full p-1" />
					</th>
					<th data-testid={generateTestId(index, 1)} class="border border-gray-300 p-2">
						<input onkeydown={onKeyDown} bind:value={variable.parentId} class="w-full p-1" />
					</th>
					<th data-testid={generateTestId(index, 2)} class="border border-gray-300 p-2">
						<input onkeydown={onKeyDown} bind:value={variable.pattern} class="w-full p-1" />
					</th>
					<th data-testid={generateTestId(index, 3)} class="border border-gray-300 p-2 text-center">
						<input type="checkbox" onkeydown={onKeyDown} bind:checked={variable.isLeaf} />
					</th>
					<th
						data-testid={generateTestId(index, 4)}
						class="group flex w-lg items-center border border-gray-300 p-2"
					>
						<input onkeydown={onKeyDown} bind:value={variable.description} class="w-full p-1" />
						<div
							data-testid={'delete-row-' + index}
							class="invisible ml-2 w-[1.5rem] transition-opacity duration-200 group-hover:visible"
						>
							<button onclick={() => deleteRow(index)}>
								<Trash2Icon class="h-4 w-4 text-red-500 hover:text-red-700" />
							</button>
						</div>
					</th>
				</tr>
			{/if}
		{/each}
	</tbody>
</table>
