import type { KeyValue } from './ApiWrapper';
import type { Filter } from '$lib/types/Filter';

export type RequestService = {
	id: number;
	headers: KeyValue[];
	body: KeyValue[];
	inline: KeyValue[];
	queryString: KeyValue[];
	filters: Filter[];
};
