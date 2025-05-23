<script>
	import Button from '$lib/components/Button.svelte';
	import HeadingFormat from '$lib/components/HeadingFormat.svelte';
	import Input from '$lib/components/Input.svelte';
	import TextArea from '$lib/components/TextArea.svelte';
	import TextFormat from '$lib/components/TextFormat.svelte';
	import { goto } from '$app/navigation';

	const sections = [
		{ id: 1, title: 'Body variables', label: 'SKU', tooltip: '(?)' },
		{ id: 2, title: 'Params / Headers', label: 'ClientId' }
	];

	export function editService() {
		goto('/edit/1');
	}
</script>

<main class="mx-auto flex w-full flex-col items-start gap-10 p-10">
	<HeadingFormat variant="primary">
		Get PnA by <span class="font-light text-yellow-500">sku</span>
	</HeadingFormat>
	<TextFormat size="body">Get price and availability based on SKU.</TextFormat>

	{#each sections as section (section.id)}
		<div class="flex w-full flex-col gap-4">
			<HeadingFormat as="h3">{section.title}</HeadingFormat>
			<div class="flex-cols flex items-center gap-4">
				<TextFormat size="body">
					{section.label}
					{#if section.tooltip}
						<span class="cursor-pointer text-red-500">{section.tooltip}</span>
					{/if}
				</TextFormat>
				<div class="h-auto w-[301px]">
					<Input text="" boxSize="sm" />
				</div>
			</div>
		</div>
	{/each}

	<span class="flex min-w-lg items-center justify-center gap-4">
		<Button
			variant="primary"
			type="submit"
			size="lg"
			className="w-[300px] h-14 shadow-md"
			onClick={editService}
		>
			Edit Service
		</Button>
		<Button variant="primary" type="submit" size="lg" className="w-[300px] h-14 shadow-md">
			Send
		</Button>
	</span>

	<HeadingFormat as="h3">Raw Response (200 OK)</HeadingFormat>
	<div class="w-3xl">
		<TextArea disabled={false} />
	</div>
</main>
