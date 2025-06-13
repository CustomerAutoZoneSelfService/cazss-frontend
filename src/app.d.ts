// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		// interface Locals {}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
	interface Window {
		E2E_MOCKED?: boolean; // DON'T MOVE THIS INTO APP. IT REDECLARES IT AS A SEPARATE INTERFACE
	}
}

export {};
