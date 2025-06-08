export type ServiceResponseStatus = {
	code: number;
	description: string;
};

//this needs to be checked
export type VariableResponse = {
	[key: string]: string[];
};

export type ServiceResponse = {
	status: ServiceResponseStatus;
	response: VariableResponse;
};
