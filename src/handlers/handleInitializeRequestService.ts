import type { RequestVariableString } from '$lib/types/RequestVariable';
import type { KeyValue } from '$lib/types/ApiWrapper';

// Function to initialize the RequestService object with the variables from the endpoint and possible default values
export const handleInitializeRequestService = (variables: RequestVariableString[]) => {
	const newHeaders: KeyValue[] = [];
	const newBody: KeyValue[] = [];
	const newInline: KeyValue[] = [];
	const newQueryString: KeyValue[] = [];

	variables.forEach((variable) => {
		const kv: KeyValue = { key: variable.keyName, value: variable.defaultValue ?? '' };
		switch (variable.type) {
			case 'HEADER':
				newHeaders.push(kv);
				break;
			case 'BODY':
				newBody.push(kv);
				break;
			case 'INLINE_PARAM':
				newInline.push(kv);
				break;
			case 'QUERY_STRING':
				newQueryString.push(kv);
				break;
		}
	});

	return {
		headers: newHeaders,
		body: newBody,
		inline: newInline,
		queryString: newQueryString
	};
};
