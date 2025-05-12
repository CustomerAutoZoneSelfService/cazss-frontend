import type { RequestVariable, VariableType } from './RequestVariable';
import type { ResponsePattern } from './ResponsePattern';

export type InputTablePrompt =
	| { endpointId: number; variableType: VariableType; requestVariables?: RequestVariable[] }
	| { responseId: number; responsePatterns?: ResponsePattern[] };
