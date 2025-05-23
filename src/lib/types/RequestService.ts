import type { KeyValue } from './ApiWrapper';

export type RequestService = {
	id: number;
	headers: KeyValue[];
	body: KeyValue[];
	inline: KeyValue[];
	queryString: KeyValue[];
	filters: KeyValue[];
};
