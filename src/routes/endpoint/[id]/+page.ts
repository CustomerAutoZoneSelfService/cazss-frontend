export type Params = {
	params: {
		id: number;
	};
};

export const load = ({ params }: Params) => {
	return {
		id: params.id
	};
};
