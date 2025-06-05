export type Params = {
	params: {
		id: number | undefined;
	};
};

export const load = ({ params }: Params) => {
	return {
		id: params.id
	};
};
