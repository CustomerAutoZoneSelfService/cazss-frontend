export type Props = {
	type?: InputType;
	text: string;
	boxSize?: InputBoxSize;
	isDisabled?: boolean;
	name?: string;
	caption?: string;
	placeholder?: string;
	handleInput?: (event: Event) => void;
	handleChange?: (event: Event) => void;
};

export type InputBoxSize = 'sm' | 'md' | 'full';

export type InputType =
	| 'button'
	| 'checkbox'
	| 'color'
	| 'date'
	| 'datetime-local'
	| 'email'
	| 'file'
	| 'hidden'
	| 'image'
	| 'month'
	| 'number'
	| 'password'
	| 'radio'
	| 'range'
	| 'reset'
	| 'search'
	| 'submit'
	| 'tel'
	| 'text'
	| 'time'
	| 'url'
	| 'week';

export const InputBoxSizeTranslations = {
	sm: 'w-80',
	md: 'w-lg',
	full: 'w-full'
};
