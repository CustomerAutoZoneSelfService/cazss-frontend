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
	requestVariableId?: number; //para post new endpoint no tiene aun asignado
	type: VariableTypeString;
	key: string;
	defaultValue: string;
	customizable: boolean;
	description: string;
};

export enum VariableType {
	header,
	query_string,
	inline_param,
	body
}

export type VariableTypeString = 'HEADER' | 'QUERY_STRING' | 'INLINE_PARAM' | 'BODY';
