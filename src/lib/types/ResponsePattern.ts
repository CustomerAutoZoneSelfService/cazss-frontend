export type ResponsePattern = {
	responsePatternId: number;
	responseId: number;
	parentId: number | null;
	pattern: string;
	name: string;
	description: string;
	isLeaf: boolean;
};
