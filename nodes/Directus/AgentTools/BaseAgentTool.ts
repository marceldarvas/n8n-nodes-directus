/**
 * Base class for all AI Agent Tools
 * Provides standardized execution, validation, and schema generation
 */

import type {
	IAgentToolConfig,
	IAgentToolResult,
	IParameterSchema,
	IOpenAIFunction,
} from './types';

/**
 * Abstract base class that all agent tools must extend
 */
export abstract class BaseAgentTool {
	/**
	 * Unique name of the tool (e.g., 'directus_read_items')
	 */
	abstract readonly name: string;

	/**
	 * Human-readable description for AI understanding
	 */
	abstract readonly description: string;

	/**
	 * Parameter definitions for this tool
	 */
	abstract readonly parameters: Record<string, IParameterSchema>;

	/**
	 * Optional category for organizing tools
	 */
	readonly category?: string;

	/**
	 * Optional usage examples for AI guidance
	 */
	readonly examples?: string[];

	/**
	 * Execute the tool with standardized error handling and result format
	 * @param params - Parameters for the tool execution
	 * @returns Standardized result with success/failure indication
	 */
	async execute(params: Record<string, any>): Promise<IAgentToolResult> {
		const startTime = Date.now();
		const timestamp = new Date().toISOString();

		try {
			// Validate parameters before execution
			const validationError = this.validateParameters(params);
			if (validationError) {
				return {
					success: false,
					error: {
						message: validationError,
						code: 'VALIDATION_ERROR',
					},
					metadata: {
						timestamp,
						operationName: this.name,
						executionTimeMs: Date.now() - startTime,
					},
				};
			}

			// Execute the actual tool logic
			const result = await this.run(params);

			return {
				success: true,
				data: result,
				metadata: {
					timestamp,
					operationName: this.name,
					executionTimeMs: Date.now() - startTime,
				},
			};
		} catch (error) {
			// Handle any errors with AI-friendly formatting
			const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
			const errorCode = (error as any).code || 'EXECUTION_ERROR';

			return {
				success: false,
				error: {
					message: errorMessage,
					code: errorCode,
					details: error,
				},
				metadata: {
					timestamp,
					operationName: this.name,
					executionTimeMs: Date.now() - startTime,
				},
			};
		}
	}

	/**
	 * Abstract method that must be implemented by each tool
	 * Contains the actual tool logic
	 * @param params - Validated parameters
	 * @returns The result data
	 */
	protected abstract run(params: Record<string, any>): Promise<any>;

	/**
	 * Validate parameters against the schema
	 * @param params - Parameters to validate
	 * @returns Error message if validation fails, null if valid
	 */
	protected validateParameters(params: Record<string, any>): string | null {
		// Check required parameters
		for (const [key, schema] of Object.entries(this.parameters)) {
			if (schema.required && !(key in params)) {
				return `Missing required parameter: ${key}`;
			}
		}

		// Check parameter types
		for (const [key, value] of Object.entries(params)) {
			const schema = this.parameters[key];
			if (!schema) {
				// Unknown parameter - warn but don't fail
				continue;
			}

			const typeError = this.validateType(value, schema, key);
			if (typeError) {
				return typeError;
			}
		}

		return null;
	}

	/**
	 * Validate a single value against its schema
	 * @param value - Value to validate
	 * @param schema - Schema to validate against
	 * @param paramName - Name of the parameter (for error messages)
	 * @returns Error message if validation fails, null if valid
	 */
	private validateType(
		value: any,
		schema: IParameterSchema,
		paramName: string,
	): string | null {
		const actualType = Array.isArray(value) ? 'array' : typeof value;

		// Check basic type match
		if (schema.type === 'integer' && typeof value === 'number') {
			if (!Number.isInteger(value)) {
				return `Parameter ${paramName} must be an integer`;
			}
		} else if (schema.type !== actualType && schema.type !== 'null') {
			return `Parameter ${paramName} must be of type ${schema.type}, got ${actualType}`;
		}

		// Check enum values if specified
		if (schema.enum && Array.isArray(schema.enum)) {
			const enumValues = schema.enum as any[];
			if (!enumValues.includes(value)) {
				return `Parameter ${paramName} must be one of: ${schema.enum.join(', ')}`;
			}
		}

		// Validate array items if type is array
		if (schema.type === 'array' && schema.items && Array.isArray(value)) {
			for (let i = 0; i < value.length; i++) {
				const itemError = this.validateType(value[i], schema.items, `${paramName}[${i}]`);
				if (itemError) {
					return itemError;
				}
			}
		}

		// Validate object properties if type is object
		if (schema.type === 'object' && schema.properties && typeof value === 'object') {
			for (const [propKey, propSchema] of Object.entries(schema.properties)) {
				if (propKey in value) {
					const propError = this.validateType(
						value[propKey],
						propSchema,
						`${paramName}.${propKey}`,
					);
					if (propError) {
						return propError;
					}
				}
			}
		}

		return null;
	}

	/**
	 * Generate OpenAI function schema for this tool
	 * @returns OpenAI function definition
	 */
	toOpenAIFunction(): IOpenAIFunction {
		const properties: Record<string, any> = {};
		const required: string[] = [];

		// Convert parameter schemas to OpenAI format
		for (const [key, schema] of Object.entries(this.parameters)) {
			const { required: isRequired, ...schemaWithoutRequired } = schema;
			properties[key] = schemaWithoutRequired;

			if (isRequired) {
				required.push(key);
			}
		}

		return {
			name: this.name,
			description: this.description,
			parameters: {
				type: 'object',
				properties,
				...(required.length > 0 ? { required } : {}),
			},
		};
	}

	/**
	 * Get the configuration for this tool
	 * @returns Tool configuration
	 */
	getConfig(): IAgentToolConfig {
		return {
			name: this.name,
			description: this.description,
			parameters: this.parameters,
			category: this.category,
			examples: this.examples,
		};
	}
}
