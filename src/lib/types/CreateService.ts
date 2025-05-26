import type { HTTPMethod, RequestVariableTypes } from './ApiWrapper';

export type CreateService = {
	id?: number; // Not needed when creating a new endpoint
	categoryId: number;
	active: boolean;
	name: string;
	description: string;
	method: HTTPMethod;
	url: string;
	authenticationStrategy: number | null;

	template: string;
	requestVariables: CreateRequestVariables[];
	responses: CreateResponse[];
};

export type CreateRequestVariables = {
	type: RequestVariableTypes;
	key: string;
	defaultValue: string;
	customizable: boolean;
	description: string;
};

export type CreateResponse = {
	statusCode: number;
	description: string;
	patterns: CreateResponsePattern[];
};

export type CreateResponsePattern = {
	parentId?: number;
	name: string;
	description: string;
	isLeaf: boolean;
	pattern: string;
};
