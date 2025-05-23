// import type { RequestVariableString } from './RequestVariable';
// import type { ResponseStatusEntry } from './ResponseStatusEntry';
// import type { Filter } from './Filter';

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
	categoryId: number;
	authenticationStrategy: string;
	name: string;
	description: string;
	active: boolean;
	method: HTTPMethod;
	url: string;
	template: string;
};

export type HistoryService = {
	historyId: number;
	email: string;
	endpointName: string;
	endpointDescription: string;
	createdAt: string;
};

// export type RequestVariable = {

// 	type: string;
// 	key: string;
// 	defaultValue: string;
// 	customizable: boolean;
// 	description: string;

// }
