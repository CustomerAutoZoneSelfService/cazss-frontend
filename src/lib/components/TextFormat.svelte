<script lang="ts">
	/*
	 * TextFormat Component
	 *
	 * A Svelte component for rendering text that is uniform throughout the app
	 * with customizable HTML tags, color variants, and sizes.
	 */

	// Define the available HTML tags for text
	type TextTag = 'p' | 'span' | 'div' | 'label';

	// Define the color variant for the text
	type TextVariant = 'primary' | 'secondary' | 'muted' | 'none';

	// Define the size options for the text
	type TextSize = 'subtitle' | 'body' | 'caption' | 'label';

	export let as: TextTag = 'p';
	export let variant: TextVariant = 'primary';
	export let size: TextSize = 'body';
	export let className = '';

	let baseFont = 'font-inter';

	// Different variants (color themes)
	$: variantStyles = {
		primary: 'text-gray-900',
		secondary: 'text-white',
		muted: 'text-gray-400',
		none: ''
	}[variant];

	// Different sizes/importance levels with their specific styles
	$: sizeStyles = {
		subtitle: 'text-lg font-medium leading-normal',
		body: 'text-base font-normal leading-relaxed',
		caption: 'text-sm font-normal leading-normal',
		label: 'text-sm font-medium leading-tight'
	}[size];

	// Form final Tailwind Class with all the arguments
	$: combinedClasses = `${baseFont} ${variantStyles} ${sizeStyles} ${className}`.trim();
</script>

<svelte:element this={as} class={combinedClasses}>
	<slot />
</svelte:element>
