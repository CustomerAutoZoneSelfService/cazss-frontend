<script lang="ts">
	/*
	 * TextFormat Component
	 *
	 * A Svelte component for rendering text that is uniform throughout the app
	 * with customizable HTML tags, color variants, and sizes.
	 */

	// Define the available HTML tags for text
	type TextTag = 'p' | 'span' | 'div' | 'label' | 'h1';

	// Define the color variant for the text
	type TextVariant = 'primary' | 'secondary' | 'muted' | 'none' | 'alert';

	// Define the size options for the text
	type TextSize = 'subtitle' | 'body' | 'caption' | 'label';

	export let as: TextTag = 'p';
	export let variant: TextVariant = 'primary';
	export let size: TextSize = 'body';
	export let className = '';

	let baseFont = 'font-inter';

	// Color styles
	$: variantStyles = {
		primary: 'text-gray-900',
		secondary: 'text-white',
		muted: 'text-gray-500',
		none: '',
		alert: 'text-red-100'
	}[variant];

	// Size styles (subtitle overrides variant color and adds custom spacing)
	$: sizeStyles = {
		subtitle: 'py-5 text-lg font-bold text-gray-500',
		body: 'text-base font-normal leading-relaxed',
		caption: 'text-sm font-normal leading-normal',
		label: 'text-sm font-medium leading-tight'
	}[size];

	// Combine all classes
	$: combinedClasses = `${baseFont} ${variantStyles} ${sizeStyles} ${className}`.trim();
</script>

<svelte:element this={as} class={combinedClasses}>
	<slot />
</svelte:element>
