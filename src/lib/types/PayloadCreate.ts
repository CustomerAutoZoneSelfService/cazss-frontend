import type { DetailedService } from './ApiWrapper';
import type { ResponseStatusEntry } from './ResponseStatusEntry';
import type { RequestVariable } from './RequestVariable';

export type PayloadCreate = {
	endpoint: DetailedService | undefined;
	requestVariables: Record<string, RequestVariable[]> | undefined;
	status: ResponseStatusEntry[] | undefined;
	// other properties
};
