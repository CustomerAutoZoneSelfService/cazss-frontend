import type { ResponsePattern } from './ResponsePattern';

export type ResponseStatusEntry = {
	value: number;
	description: string;
	patterns: ResponsePattern[];
};
