import type { RequestVariableString } from './RequestVariable';
import type { Filter } from './Filter';

export type HTTPMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

export type KeyValue = {
	key: string;
	value: string;
};

export type ResponseStatus = {
	status: number;
	description: string;
};

export type Service = {
	endpointId: number;
	name: string;
	description: string;
};

export type DetailedService = {
	id: number; // TODO Check this later
	name: string;
	description: string;
	active: boolean;
	method: HTTPMethod;
	url: string;
	responses: ResponseStatus[];
	filters: Filter[];
	variables: RequestVariableString[];
	requestBody: string; // ? This should be the template
};

export type HistoryService = {
	endpoint: any;
	created: string | number | Date;
	description: string;
	name: string;
	historyId: number;
	email: string;
	endpointName: string;
	endpointDescription: string;
	createdAt: string;
	inputs?: Array<{ name: string; value: string }>;
	output?: { status: number; data: Record<string, unknown> };
};
