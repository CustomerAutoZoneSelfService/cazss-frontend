<script lang="ts">
	import Icon from '$lib/components/Icon.svelte'; // usa tu wrapper de IconList + lucide
	export let fileUrl: string = '';
	export let fileName: string = 'archivo';
	export let size: 'sm' | 'md' | 'lg' = 'md';
	export let disabled: boolean = false;
	export let variant: 'primary' | 'secondary' | 'text' = 'text';
	export let iconOnly: boolean = true;

	function handleDownload() {
		if (!disabled && fileUrl) {
			const link = document.createElement('a');
			link.href = fileUrl;
			link.download = fileName;
			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);
		}
	}

	function computeClasses() {
		let baseClasses =
			'inline-flex items-center justify-center font-bold rounded-md ' +
			'focus:outline-none transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed';

		let variantClasses = '';
		switch (variant) {
			case 'primary':
				variantClasses = 'bg-accent-red text-white hover:bg-accent-red-dark hover:shadow-md';
				break;
			case 'secondary':
				variantClasses = 'bg-gray-200 text-black hover:bg-gray-300 active:bg-gray-400';
				break;
			case 'text':
				variantClasses = 'text-accent-red bg-transparent hover:text-accent-red-dark hover:underline';
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

<button class={computeClasses()} on:click={handleDownload} {disabled}>
	<Icon name="Download" size={20} color="currentColor" />
</button>
