import type { HTTPMethod, RequestVariableTypes } from './ApiWrapper';

export type ConfigureService = {
	endpointId?: number; // Not needed when creating a new endpoint
	categoryId: number;
	active: boolean;
	name: string;
	description: string;
	method: HTTPMethod;
	url: string;
	authenticationStrategy: number | null;

	template: string;
	requestVariables: RequestVariable[];
	responses: Response[];
};

export type RequestVariable = {
	type: RequestVariableTypes;
	key: string;
	defaultValue: string;
	customizable: boolean;
	description: string;
};

export type Response = {
	responseId?: number; // Not needed when creating a new endpoint
	endpointId?: number; // Not needed when creating a new endpoint
	statusCode: number;
	description: string;
	patterns: ResponsePattern[];
};

export type ResponsePattern = {
	responsePatternId?: number;
	parentId?: number | null;
	name: string;
	description: string;
	isLeaf: boolean;
	pattern: string;
};
