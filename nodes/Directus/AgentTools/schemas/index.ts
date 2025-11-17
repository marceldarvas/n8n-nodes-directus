/**
 * OpenAI Function Calling Schemas for Directus Agent Tools
 *
 * This module exports all agent tool implementations and provides
 * utilities for registering them with the tool registry.
 *
 * @example
 * ```typescript
 * import { registerAllTools } from './AgentTools/schemas';
 *
 * // Register all tools with the registry
 * registerAllTools(executionContext);
 *
 * // Get OpenAI function schemas
 * const functions = toolRegistry.getOpenAIFunctions();
 * ```
 */

import type { IExecuteFunctions } from 'n8n-workflow';
import { toolRegistry } from '../ToolRegistry';
import { UserManagementTool } from './UserManagementTool';
import { FlowTriggerTool } from './FlowTriggerTool';
import { ActivityQueryTool } from './ActivityQueryTool';
import { ItemQueryTool } from './ItemQueryTool';
import { SchemaValidator } from './SchemaValidator';

// Export individual tools
export { UserManagementTool } from './UserManagementTool';
export { FlowTriggerTool } from './FlowTriggerTool';
export { ActivityQueryTool } from './ActivityQueryTool';
export { ItemQueryTool } from './ItemQueryTool';
export { SchemaValidator } from './SchemaValidator';

/**
 * Register all agent tools with the tool registry
 * @param executionContext - n8n execution context for API calls
 * @returns Array of registered tool instances
 */
export function registerAllTools(executionContext: IExecuteFunctions) {
	const tools = [
		new UserManagementTool(executionContext),
		new FlowTriggerTool(executionContext),
		new ActivityQueryTool(executionContext),
		new ItemQueryTool(executionContext),
	];

	// Register all tools
	toolRegistry.registerMany(tools);

	return tools;
}

/**
 * Get all tool instances without registering them
 * @param executionContext - n8n execution context for API calls
 * @returns Array of tool instances
 */
export function getAllTools(executionContext: IExecuteFunctions) {
	return [
		new UserManagementTool(executionContext),
		new FlowTriggerTool(executionContext),
		new ActivityQueryTool(executionContext),
		new ItemQueryTool(executionContext),
	];
}

/**
 * Get OpenAI function schemas for all tools
 * @param executionContext - n8n execution context for API calls
 * @returns Array of OpenAI function definitions
 */
export function getOpenAIFunctionSchemas(executionContext: IExecuteFunctions) {
	const tools = getAllTools(executionContext);
	return tools.map(tool => tool.toOpenAIFunction());
}

/**
 * Get tools grouped by category
 * @param executionContext - n8n execution context for API calls
 * @returns Object with tools grouped by category
 */
export function getToolsByCategory(executionContext: IExecuteFunctions) {
	const tools = getAllTools(executionContext);
	const byCategory: Record<string, typeof tools> = {};

	tools.forEach(tool => {
		const category = tool.category || 'uncategorized';
		if (!byCategory[category]) {
			byCategory[category] = [];
		}
		byCategory[category].push(tool);
	});

	return byCategory;
}

/**
 * Tool categories for organization
 */
export const TOOL_CATEGORIES = {
	USER_MANAGEMENT: 'user_management',
	FLOW_MANAGEMENT: 'flow_management',
	MONITORING: 'monitoring',
	DATA_ACCESS: 'data_access',
} as const;

/**
 * Default export containing all utilities
 */
export default {
	registerAllTools,
	getAllTools,
	getOpenAIFunctionSchemas,
	getToolsByCategory,
	TOOL_CATEGORIES,
	// Tool classes
	UserManagementTool,
	FlowTriggerTool,
	ActivityQueryTool,
	ItemQueryTool,
	SchemaValidator,
};
