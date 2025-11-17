/**
 * Schema Validator for AI Agent Tools
 * Provides advanced JSON schema validation utilities
 */

import type { IParameterSchema } from '../types';

/**
 * Validation error details
 */
export interface IValidationError {
	field: string;
	message: string;
	value?: any;
	expectedType?: string;
	constraint?: string;
}

/**
 * Validation result
 */
export interface IValidationResult {
	valid: boolean;
	errors: IValidationError[];
}

/**
 * Schema validator with advanced validation capabilities
 */
export class SchemaValidator {
	/**
	 * Validate a value against a parameter schema with detailed error reporting
	 * @param value - Value to validate
	 * @param schema - Schema to validate against
	 * @param fieldName - Name of the field being validated
	 * @returns Validation result with detailed errors
	 */
	static validateValue(
		value: any,
		schema: IParameterSchema,
		fieldName: string,
	): IValidationResult {
		const errors: IValidationError[] = [];

		// Check required
		if (schema.required && (value === undefined || value === null)) {
			errors.push({
				field: fieldName,
				message: `${fieldName} is required`,
			});
			return { valid: false, errors };
		}

		// Skip further validation if value is not provided and not required
		if (value === undefined || value === null) {
			return { valid: true, errors: [] };
		}

		// Validate type
		const actualType = Array.isArray(value) ? 'array' : typeof value;
		const expectedType = schema.type;

		if (expectedType === 'integer') {
			if (typeof value !== 'number') {
				errors.push({
					field: fieldName,
					message: `${fieldName} must be a number`,
					value,
					expectedType: 'integer',
				});
			} else if (!Number.isInteger(value)) {
				errors.push({
					field: fieldName,
					message: `${fieldName} must be an integer`,
					value,
					expectedType: 'integer',
				});
			}
		} else if (expectedType !== actualType && expectedType !== 'null') {
			errors.push({
				field: fieldName,
				message: `${fieldName} must be of type ${expectedType}`,
				value,
				expectedType,
			});
		}

		// Validate enum values
		if (schema.enum && Array.isArray(schema.enum)) {
			const enumValues = schema.enum as any[];
			if (!enumValues.includes(value)) {
				errors.push({
					field: fieldName,
					message: `${fieldName} must be one of: ${enumValues.join(', ')}`,
					value,
					constraint: `enum: [${enumValues.join(', ')}]`,
				});
			}
		}

		// Validate array items
		if (schema.type === 'array' && schema.items && Array.isArray(value)) {
			value.forEach((item, index) => {
				const itemResult = this.validateValue(
					item,
					schema.items!,
					`${fieldName}[${index}]`,
				);
				errors.push(...itemResult.errors);
			});
		}

		// Validate object properties
		if (schema.type === 'object' && schema.properties && typeof value === 'object') {
			for (const [propKey, propSchema] of Object.entries(schema.properties)) {
				const propResult = this.validateValue(
					value[propKey],
					propSchema,
					`${fieldName}.${propKey}`,
				);
				errors.push(...propResult.errors);
			}
		}

		// Additional validations could be added here:
		// - String length (minLength, maxLength)
		// - Number range (minimum, maximum)
		// - Pattern matching (regex)
		// - Format validation (email, uri, date-time, etc.)

		return {
			valid: errors.length === 0,
			errors,
		};
	}

	/**
	 * Validate an object against a schema definition
	 * @param data - Data object to validate
	 * @param schema - Schema definition (parameter schemas)
	 * @returns Validation result
	 */
	static validate(
		data: Record<string, any>,
		schema: Record<string, IParameterSchema>,
	): IValidationResult {
		const errors: IValidationError[] = [];

		// Check required parameters
		for (const [key, paramSchema] of Object.entries(schema)) {
			if (paramSchema.required && !(key in data)) {
				errors.push({
					field: key,
					message: `Missing required parameter: ${key}`,
				});
			}
		}

		// Validate provided parameters
		for (const [key, value] of Object.entries(data)) {
			const paramSchema = schema[key];
			if (paramSchema) {
				const result = this.validateValue(value, paramSchema, key);
				errors.push(...result.errors);
			}
			// Note: Unknown parameters are allowed (not treated as errors)
		}

		return {
			valid: errors.length === 0,
			errors,
		};
	}

	/**
	 * Format validation errors as a human-readable message
	 * @param errors - Array of validation errors
	 * @returns Formatted error message
	 */
	static formatErrors(errors: IValidationError[]): string {
		if (errors.length === 0) {
			return 'No validation errors';
		}

		return errors
			.map((error) => {
				let msg = `- ${error.message}`;
				if (error.value !== undefined) {
					msg += ` (received: ${JSON.stringify(error.value)})`;
				}
				if (error.constraint) {
					msg += ` [${error.constraint}]`;
				}
				return msg;
			})
			.join('\n');
	}

	/**
	 * Sanitize and coerce values to match schema types where possible
	 * @param data - Data object to sanitize
	 * @param schema - Schema definition
	 * @returns Sanitized data object
	 */
	static sanitize(
		data: Record<string, any>,
		schema: Record<string, IParameterSchema>,
	): Record<string, any> {
		const sanitized: Record<string, any> = { ...data };

		for (const [key, value] of Object.entries(sanitized)) {
			const paramSchema = schema[key];
			if (!paramSchema) continue;

			// Apply default value if not provided
			if ((value === undefined || value === null) && paramSchema.default !== undefined) {
				sanitized[key] = paramSchema.default;
				continue;
			}

			// Skip null/undefined values
			if (value === undefined || value === null) continue;

			// Type coercion
			switch (paramSchema.type) {
				case 'integer':
					if (typeof value === 'string' && !isNaN(parseInt(value, 10))) {
						sanitized[key] = parseInt(value, 10);
					}
					break;
				case 'number':
					if (typeof value === 'string' && !isNaN(parseFloat(value))) {
						sanitized[key] = parseFloat(value);
					}
					break;
				case 'boolean':
					if (typeof value === 'string') {
						sanitized[key] = value.toLowerCase() === 'true' || value === '1';
					} else if (typeof value === 'number') {
						sanitized[key] = value !== 0;
					}
					break;
				case 'string':
					if (typeof value !== 'string') {
						sanitized[key] = String(value);
					}
					break;
				case 'object':
					if (typeof value === 'string') {
						try {
							sanitized[key] = JSON.parse(value);
						} catch (e) {
							// Keep original value if parse fails
						}
					}
					break;
				case 'array':
					if (!Array.isArray(value)) {
						// Wrap single values in array if schema expects array
						sanitized[key] = [value];
					}
					break;
			}
		}

		return sanitized;
	}
}
