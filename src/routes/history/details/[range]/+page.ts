export type Params = {
	params: {
		range: string;
	};
};

export const load = ({ params }: Params) => {
	return {
		range: params.range
	};
};
