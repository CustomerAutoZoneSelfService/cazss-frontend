// Individual filter definition
export type Filter = {
	responsePatternId: number;
	pattern: string;
	name: string;
	description: string;
};

// Used for creating/updating filters — array of integers
export type RequestUserFilterDTO = number[];

// What the backend returns from GET /user-filters
export type UserFilterDTO = {
	responsePatternId: number;
};
