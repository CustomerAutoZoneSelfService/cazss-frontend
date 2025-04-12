<script lang="ts">
	import '../app.css';
	export let variant: 'primary' | 'secondary' | 'text' = 'primary';
	export let size: 'sm' | 'md' | 'lg' = 'md';
	export let disabled: boolean = false;
	export let type: 'button' | 'submit' | 'reset' = 'button';
	export let onClick: ((event: MouseEvent) => void) | null = null;
	export let iconOnly: boolean = false;

	/**
	 * Handle click events, but only if not disabled.
	 */
	function handleClick(event: MouseEvent) {
		if (!disabled && onClick) {
			onClick(event);
		}
	}

	/**
	 * Generate the Tailwind classes based on props.
	 */
	function computeClasses() {
		let baseClasses =
			'inline-flex items-center justify-center font-bold rounded-md ' +
			'focus:outline-none transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed';

		let variantClasses = '';
		switch (variant) {
			case 'primary':
				variantClasses = `bg-[var(--color-accent-red)] text-white hover:bg-[var(--color-accent-red-dark)]
                                   hover:shadow-md`;
				break;
			case 'secondary':
				variantClasses = 'bg-gray-200 text-black hover:bg-gray-300 active:bg-gray-400';
				break;
			case 'text':
				variantClasses = `text-[var(--color-accent-red)] bg-transparent hover:text-[var(--color-accent-red-dark)]
                                hover:underline`;
				break;
		}

		let sizeClasses = '';
		switch (size) {
			case 'sm':
				sizeClasses = iconOnly ? 'w-8 h-8' : 'px-3 py-1 text-sm';
				break;
			case 'md':
				sizeClasses = iconOnly ? 'w-10 h-10' : 'px-4 py-2 text-base';
				break;
			case 'lg':
				sizeClasses = iconOnly ? 'w-12 h-12' : 'px-6 py-3 text-lg';
				break;
		}

		const iconOnlyClass = iconOnly ? 'rounded-full' : '';

		return `${baseClasses} ${variantClasses} ${sizeClasses} ${iconOnlyClass}`;
	}
</script>

<button {type} class={computeClasses()} on:click={handleClick} {disabled} {...$$restProps}>
	<slot />
</button>

<style>
	:global(button[class*='icon-button']) :global(svg) {
		transition: transform 0.2s ease;
	}

	:global(button[class*='icon-button']:hover) :global(svg) {
		transform: scale(1.2);
	}
</style>
