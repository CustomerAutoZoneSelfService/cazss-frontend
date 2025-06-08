export type Filter = {
	responsePatternId: number;
	pattern: string;
	name: string;
	description: string;
};

export type RequestUserFilterDTO = {
	endpointId: number;
	responsePatternIds: number[];
};

export type userFilters = {
	endpointId: number;
	userFilters: Filter[];
};
