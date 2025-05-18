// This might be the closest thing to a "correct" Icon component
// (because Vite doesn't care about tree shaking in dev mode)
declare module 'lucide-svelte/icons' {
	import { LucideProps } from 'lucide-svelte/dist/types.d.ts';
	import { SvelteComponent } from 'svelte';
	const cmp: SvelteComponent<LucideProps>;

	export = cmp;
}
