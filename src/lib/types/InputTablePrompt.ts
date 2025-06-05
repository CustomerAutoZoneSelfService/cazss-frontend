import type { RequestVariable, ResponsePattern } from './ConfigureService';
import type { RequestVariableTypes } from './ApiWrapper';

export type InputTablePrompt =
	| {
			requestVariables: RequestVariable[];
			//This value is only needed when the table receibes request variables
			requestVariableType: RequestVariableTypes;
	  }
	| { responsePatterns: ResponsePattern[] };
