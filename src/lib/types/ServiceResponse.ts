export type ServiceResponseStatus = {
	code: number;
	description: string;
};

/**
 * {
    "status": {
        "code": 200,
        "description": "OK"
    },
    "response": {
		-1: [""]
	}
}
 */
export type VariableResponse = {
	[key: number]: string[];
};

export type ServiceResponse = {
	status: ServiceResponseStatus;
	response: VariableResponse;
};
