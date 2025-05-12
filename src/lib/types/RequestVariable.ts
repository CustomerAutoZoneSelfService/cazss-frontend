export type RequestVariable = {
	requestVariableId: number;
	endpointId: number;
	type: VariableType;
	key: string;
	defaultValue: string;
	customizable: boolean;
	description: string;
};

export type RequestVariableString = {
	requestVariableId: number;
	type: VariableTypeString;
	keyName: string;
	defaultValue: string;
	customizable: boolean;
	description: string;
};

export enum VariableType {
	header,
	query_string,
	inlline_param,
	body
}

export type VariableTypeString = 'HEADER' | 'QUERY_STRING' | 'INLINE_PARAM' | 'BODY';
