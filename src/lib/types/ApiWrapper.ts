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
