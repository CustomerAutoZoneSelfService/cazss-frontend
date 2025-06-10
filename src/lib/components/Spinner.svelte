<script lang="ts">
	// Type definitions
	type SpinnerVariant = 'ring' | 'double-ring' | 'dots' | 'pulse' | 'bars' | 'grid';
	type TailwindSize = 'w-4 h-4' | 'w-6 h-6' | 'w-8 h-8' | 'w-10 h-10' | 'w-12 h-12' | 'w-16 h-16';
	type TailwindColor = string; // Any valid Tailwind color class
	type TailwindAnimation = 'animate-spin' | 'animate-pulse' | 'animate-bounce';

	// Props with TypeScript types
	export let size: TailwindSize = 'w-8 h-8';
	export let color: TailwindColor = 'border-blue-500';
	export let variant: SpinnerVariant = 'ring';
	export let speed: TailwindAnimation = 'animate-spin';

	// Size mappings for different variants with proper typing
	const dotSize: Record<TailwindSize, string> = {
		'w-4 h-4': 'w-1 h-1',
		'w-6 h-6': 'w-1.5 h-1.5',
		'w-8 h-8': 'w-2 h-2',
		'w-10 h-10': 'w-2.5 h-2.5',
		'w-12 h-12': 'w-3 h-3',
		'w-16 h-16': 'w-4 h-4'
	};

	const barWidth: Record<TailwindSize, string> = {
		'w-4 h-4': 'w-0.5',
		'w-6 h-6': 'w-0.5',
		'w-8 h-8': 'w-1',
		'w-10 h-10': 'w-1',
		'w-12 h-12': 'w-1.5',
		'w-16 h-16': 'w-2'
	};
</script>

<div>
	{#if variant === 'ring'}
		<div class="relative inline-block {size}">
			<div class="absolute rounded-full border-4 {size} {color} border-t-transparent {speed}"></div>
		</div>
	{:else if variant === 'double-ring'}
		<div class="relative inline-block {size}">
			<div class="absolute rounded-full border-4 {size} {color} border-t-transparent {speed}"></div>
			<div
				class="absolute rounded-full border-2 {size} animate-spin border-gray-300 border-t-transparent"
				style="animation-direction: reverse; animation-duration: 1.5s;"
			></div>
		</div>
	{:else if variant === 'dots'}
		<div class="inline-flex items-center justify-center space-x-1 {size}">
			<div
				class="rounded-full bg-current {dotSize[size] || 'h-2 w-2'} {color.replace(
					'border-',
					'text-'
				)} animate-bounce"
				style="animation-delay: 0s;"
			></div>
			<div
				class="rounded-full bg-current {dotSize[size] || 'h-2 w-2'} {color.replace(
					'border-',
					'text-'
				)} animate-bounce"
				style="animation-delay: 0.1s;"
			></div>
			<div
				class="rounded-full bg-current {dotSize[size] || 'h-2 w-2'} {color.replace(
					'border-',
					'text-'
				)} animate-bounce"
				style="animation-delay: 0.2s;"
			></div>
		</div>
	{:else if variant === 'pulse'}
		<div
			class="rounded-full bg-current {size} {color.replace('border-', 'text-')} animate-pulse"
		></div>
	{:else if variant === 'bars'}
		<div class="inline-flex items-end justify-center space-x-1 {size}">
			<div
				class="bg-current {barWidth[size] || 'w-1'} h-full {color.replace(
					'border-',
					'text-'
				)} animate-pulse"
				style="animation-delay: 0s;"
			></div>
			<div
				class="bg-current {barWidth[size] || 'w-1'} h-3/4 {color.replace(
					'border-',
					'text-'
				)} animate-pulse"
				style="animation-delay: 0.1s;"
			></div>
			<div
				class="bg-current {barWidth[size] || 'w-1'} h-full {color.replace(
					'border-',
					'text-'
				)} animate-pulse"
				style="animation-delay: 0.2s;"
			></div>
			<div
				class="bg-current {barWidth[size] || 'w-1'} h-1/2 {color.replace(
					'border-',
					'text-'
				)} animate-pulse"
				style="animation-delay: 0.3s;"
			></div>
			<div
				class="bg-current {barWidth[size] || 'w-1'} h-3/4 {color.replace(
					'border-',
					'text-'
				)} animate-pulse"
				style="animation-delay: 0.4s;"
			></div>
		</div>
	{:else if variant === 'grid'}
		<div class="inline-grid grid-cols-3 gap-1 {size}">
			<!-- eslint-disable-next-line @typescript-eslint/no-unused-vars -->
			{#each Array(9) as _, i (i)}
				<div
					class="bg-current {color.replace('border-', 'text-')} animate-pulse rounded"
					style="animation-delay: {i * 0.1}s;"
				></div>
			{/each}
		</div>
	{/if}
</div>

<style>
	/* Custom animations for more complex effects */
	@keyframes fadeInOut {
		0%,
		80%,
		100% {
			opacity: 0.2;
		}
		40% {
			opacity: 1;
		}
	}

	.animate-fade {
		animation: fadeInOut 1.5s infinite ease-in-out;
	}
</style>
