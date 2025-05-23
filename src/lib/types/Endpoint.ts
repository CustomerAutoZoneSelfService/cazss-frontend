export type Endpoint = {
	name: string;
	id?: number;
	title: string;
	description: string;
	method: 'GET' | 'POST' | 'PUT' | 'DELETE';
	url: string;
	authenticationStrategy: string;
	category: string;
	enabled: boolean;
};
