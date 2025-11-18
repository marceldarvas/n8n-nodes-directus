/**
 * Types and interfaces for AI Agent Tool Wrapper Architecture
 */

/**
 * Parameter type definitions following OpenAI function schema
 */
export type ParameterType =
	| 'string'
	| 'number'
	| 'integer'
	| 'boolean'
	| 'array'
	| 'object'
	| 'null';

/**
 * Schema definition for a single parameter
 */
export interface IParameterSchema {
	/** Type of the parameter */
	type: ParameterType;
	/** Description of the parameter for AI understanding */
	description: string;
	/** Whether this parameter is required */
	required?: boolean;
	/** Enum values for restricted choices */
	enum?: string[] | number[];
	/** Default value if not provided */
	default?: any;
	/** For array types, defines the schema of items */
	items?: IParameterSchema;
	/** For object types, defines the schema of properties */
	properties?: Record<string, IParameterSchema>;
	/** Additional schema properties */
	[key: string]: any;
}

/**
 * Configuration for an agent tool
 */
export interface IAgentToolConfig {
	/** Unique name of the tool */
	name: string;
	/** Human-readable description for AI understanding */
	description: string;
	/** Parameter definitions */
	parameters: Record<string, IParameterSchema>;
	/** Category for organizing tools */
	category?: string;
	/** Example usage for AI guidance */
	examples?: string[];
}

/**
 * Metadata included with tool execution results
 */
export interface IToolResultMetadata {
	/** ISO timestamp when operation started */
	timestamp: string;
	/** Name of the operation that was executed */
	operationName: string;
	/** Execution time in milliseconds */
	executionTimeMs: number;
	/** Additional context-specific metadata */
	[key: string]: any;
}

/**
 * Standardized result format for agent tool execution
 */
export interface IAgentToolResult<T = any> {
	/** Whether the operation succeeded */
	success: boolean;
	/** Result data if successful */
	data?: T;
	/** Error information if failed */
	error?: {
		/** Error message that AI can understand */
		message: string;
		/** Error code or type */
		code?: string;
		/** Detailed error information */
		details?: any;
	};
	/** Metadata about the execution */
	metadata: IToolResultMetadata;
}

/**
 * OpenAI Function schema format
 */
export interface IOpenAIFunction {
	/** Function name */
	name: string;
	/** Function description */
	description: string;
	/** Parameter schema in JSON Schema format */
	parameters: {
		type: 'object';
		properties: Record<string, any>;
		required?: string[];
	};
}
