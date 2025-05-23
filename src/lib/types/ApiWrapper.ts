import type { RequestVariableString } from './RequestVariable';
import type { Filter } from './Filter';
import type { Endpoint } from './Endpoint';

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
	historyId: number;
	email: string;
	endpointName: string;
	endpointDescription: string;
	createdAt: string;
};

export type DetailedHistoryService = {
	historyId: number;
	statusCode: number;
	endpoint: {
		endpointId: number;
		name: string;
		description: string;
	};
	historyData: {
		request: Record<string, unknown>;
		response: Record<string, unknown>;
	};
};
