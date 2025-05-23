export type ResponsePattern = {
	responsePatternId: number;
	responseId: number;
	parentId?: number;
	pattern: string;
	name: string;
	description: string;
	isLeaf: boolean;
};
