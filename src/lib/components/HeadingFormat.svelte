<script lang="ts">
	export let as: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' = 'h1';
	export let variant: 'primary' | 'secondary' | 'muted' = 'primary';
	export let disabled = false;
	export let onClick: (() => void) | null = null;

	let baseStyles = 'transition-all duration-200';

	//Different styles
	$: variantStyles = {
		primary: 'text-black font-semibold',
		secondary: 'text-primary font-semibold',
		muted: 'text-gray-medium font-semibold'
	}[variant];

	$: disabledStyles = disabled
		? 'opacity-50 cursor-not-allowed pointer-events-none'
		: 'hover:text-blue-500 active:text-blue-700 cursor-pointer';

	//Different size options
	$: sizeStyles = {
		h1: 'text-4xl',
		h2: 'text-3xl',
		h3: 'text-2xl',
		h4: 'text-xl',
		h5: 'text-lg',
		h6: 'text-base'
	}[as];

	$: combinedClasses = `${baseStyles} ${variantStyles} ${disabledStyles} ${sizeStyles}`;
</script>

<svelte:element
	this={as}
	class={combinedClasses}
	on:click={() => !disabled && onClick?.()}
	role={onClick && !disabled ? 'button' : undefined}
	tabindex={onClick && !disabled ? 0 : undefined}
>
	<slot />
</svelte:element>
