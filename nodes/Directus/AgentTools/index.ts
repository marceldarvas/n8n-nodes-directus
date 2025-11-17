/**
 * AI Agent Tool Wrapper Architecture
 *
 * This module provides a standardized architecture for wrapping Directus operations
 * as n8n agent tools with AI-friendly interfaces.
 *
 * Key Features:
 * - Standardized input/output schemas (OpenAI function format)
 * - Error handling that AI can understand
 * - Success/failure indicators
 * - Metadata (timestamp, operation name, execution time)
 * - Stateless design
 *
 * @example
 * ```typescript
 * import { BaseAgentTool, toolRegistry, IAgentToolResult } from './AgentTools';
 *
 * class MyTool extends BaseAgentTool {
 *   readonly name = 'my_tool';
 *   readonly description = 'Does something useful';
 *   readonly parameters = {
 *     param1: { type: 'string', description: 'A parameter', required: true }
 *   };
 *
 *   protected async run(params: Record<string, any>): Promise<any> {
 *     return { result: 'success' };
 *   }
 * }
 *
 * const tool = new MyTool();
 * toolRegistry.register(tool);
 * const result = await tool.execute({ param1: 'value' });
 * ```
 */

// Export types
export type {
	ParameterType,
	IParameterSchema,
	IAgentToolConfig,
	IToolResultMetadata,
	IAgentToolResult,
	IOpenAIFunction,
} from './types';

// Export base class
export { BaseAgentTool } from './BaseAgentTool';

// Export registry
export { ToolRegistry, toolRegistry } from './ToolRegistry';
