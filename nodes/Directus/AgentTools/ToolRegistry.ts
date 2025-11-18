/**
 * Registry for managing AI Agent Tools
 * Provides centralized tool management and schema generation
 */

import type { BaseAgentTool } from './BaseAgentTool';
import type { IOpenAIFunction } from './types';

/**
 * Singleton registry for managing agent tools
 */
export class ToolRegistry {
	private tools: Map<string, BaseAgentTool> = new Map();
	private static instance: ToolRegistry;

	/**
	 * Private constructor to enforce singleton pattern
	 */
	private constructor() {}

	/**
	 * Get the singleton instance of the registry
	 * @returns The registry instance
	 */
	static getInstance(): ToolRegistry {
		if (!ToolRegistry.instance) {
			ToolRegistry.instance = new ToolRegistry();
		}
		return ToolRegistry.instance;
	}

	/**
	 * Register a new tool in the registry
	 * @param tool - The tool instance to register
	 * @throws Error if a tool with the same name already exists
	 */
	register(tool: BaseAgentTool): void {
		if (this.tools.has(tool.name)) {
			throw new Error(`Tool with name '${tool.name}' is already registered`);
		}
		this.tools.set(tool.name, tool);
	}

	/**
	 * Register multiple tools at once
	 * @param tools - Array of tool instances to register
	 */
	registerMany(tools: BaseAgentTool[]): void {
		for (const tool of tools) {
			this.register(tool);
		}
	}

	/**
	 * Retrieve a tool by name
	 * @param name - Name of the tool to retrieve
	 * @returns The tool instance or undefined if not found
	 */
	getTool(name: string): BaseAgentTool | undefined {
		return this.tools.get(name);
	}

	/**
	 * Get all registered tools
	 * @returns Array of all tool instances
	 */
	getAllTools(): BaseAgentTool[] {
		return Array.from(this.tools.values());
	}

	/**
	 * Get tools filtered by category
	 * @param category - Category to filter by
	 * @returns Array of tools in the specified category
	 */
	getToolsByCategory(category: string): BaseAgentTool[] {
		return this.getAllTools().filter((tool) => tool.category === category);
	}

	/**
	 * Export all tools as OpenAI function definitions
	 * @returns Array of OpenAI function schemas
	 */
	getOpenAIFunctions(): IOpenAIFunction[] {
		return this.getAllTools().map((tool) => tool.toOpenAIFunction());
	}

	/**
	 * Export tools as OpenAI function definitions filtered by category
	 * @param category - Category to filter by
	 * @returns Array of OpenAI function schemas for the category
	 */
	getOpenAIFunctionsByCategory(category: string): IOpenAIFunction[] {
		return this.getToolsByCategory(category).map((tool) => tool.toOpenAIFunction());
	}

	/**
	 * Check if a tool is registered
	 * @param name - Name of the tool to check
	 * @returns True if the tool is registered
	 */
	hasTool(name: string): boolean {
		return this.tools.has(name);
	}

	/**
	 * Unregister a tool by name
	 * @param name - Name of the tool to unregister
	 * @returns True if the tool was found and removed
	 */
	unregister(name: string): boolean {
		return this.tools.delete(name);
	}

	/**
	 * Clear all registered tools
	 */
	clear(): void {
		this.tools.clear();
	}

	/**
	 * Get the number of registered tools
	 * @returns Count of registered tools
	 */
	get count(): number {
		return this.tools.size;
	}

	/**
	 * Get all tool names
	 * @returns Array of tool names
	 */
	getToolNames(): string[] {
		return Array.from(this.tools.keys());
	}
}

/**
 * Export a default instance for convenience
 */
export const toolRegistry = ToolRegistry.getInstance();
