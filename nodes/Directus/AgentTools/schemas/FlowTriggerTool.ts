/**
 * Flow Trigger Tool for AI Agents
 * Provides flow triggering capabilities with optional wait for completion
 */

import type { IExecuteFunctions } from 'n8n-workflow';
import { BaseAgentTool } from '../BaseAgentTool';
import type { IParameterSchema } from '../types';
import { triggerFlow, pollFlowExecution } from '../../GenericFunctions';

/**
 * Tool for triggering Directus flows
 */
export class FlowTriggerTool extends BaseAgentTool {
	readonly name = 'directus_trigger_flow';
	readonly description = 'Trigger a Directus flow by ID or name, optionally wait for completion and return the result';
	readonly category = 'flow_management';

	readonly parameters: Record<string, IParameterSchema> = {
		flow_id: {
			type: 'string',
			description: 'The UUID or ID of the flow to trigger',
			required: true,
		},
		payload: {
			type: 'object',
			description: 'Optional data payload to pass to the flow. Can be any JSON object.',
			required: false,
			default: {},
		},
		wait_for_completion: {
			type: 'boolean',
			description: 'Whether to wait for the flow to complete before returning. If true, polls until completion.',
			required: false,
			default: false,
		},
		max_wait_time: {
			type: 'integer',
			description: 'Maximum time to wait for completion in seconds (only used if wait_for_completion is true)',
			required: false,
			default: 60,
		},
		poll_interval: {
			type: 'integer',
			description: 'Interval between status checks in milliseconds (only used if wait_for_completion is true)',
			required: false,
			default: 1000,
		},
	};

	readonly examples = [
		'Trigger flow "abc-123-def" with payload {"user_id": 42, "action": "notify"}',
		'Trigger flow "data-sync-flow" and wait for completion with max wait time of 120 seconds',
		'Trigger flow "email-campaign" with payload {"campaign_id": "summer-2024"}, wait for completion',
	];

	private executionContext: IExecuteFunctions;

	constructor(executionContext: IExecuteFunctions) {
		super();
		this.executionContext = executionContext;
	}

	/**
	 * Execute flow triggering
	 * @param params - Flow trigger parameters
	 * @returns Flow execution result
	 */
	protected async run(params: Record<string, any>): Promise<any> {
		const flowId = params.flow_id;
		const payload = params.payload || {};
		const waitForCompletion = params.wait_for_completion || false;
		const maxWaitTime = (params.max_wait_time || 60) * 1000; // Convert to milliseconds
		const pollInterval = params.poll_interval || 1000;

		// Trigger the flow
		const triggerResponse = await triggerFlow.call(
			this.executionContext,
			flowId,
			payload,
		);

		// Extract execution ID if available
		const executionId = triggerResponse.executionId ||
			triggerResponse.data?.executionId ||
			triggerResponse.id;

		// If not waiting for completion, return immediately
		if (!waitForCompletion) {
			return {
				triggered: true,
				flow_id: flowId,
				execution_id: executionId,
				response: triggerResponse,
				status: 'triggered',
				message: 'Flow triggered successfully. Not waiting for completion.',
			};
		}

		// Wait for flow completion
		if (!executionId) {
			// If no execution ID, we can't poll - return the trigger response
			return {
				triggered: true,
				flow_id: flowId,
				response: triggerResponse,
				status: 'triggered',
				warning: 'No execution ID returned. Cannot wait for completion.',
			};
		}

		try {
			const completionResult = await pollFlowExecution.call(
				this.executionContext,
				executionId,
				maxWaitTime,
				pollInterval,
			);

			return {
				triggered: true,
				flow_id: flowId,
				execution_id: executionId,
				status: completionResult.status || 'completed',
				completed_at: completionResult.timestamp,
				duration_ms: completionResult.duration,
				user: completionResult.user,
				activity: completionResult.activity,
				result: completionResult,
				message: `Flow completed with status: ${completionResult.status}`,
			};
		} catch (error: any) {
			// Handle timeout or polling errors
			return {
				triggered: true,
				flow_id: flowId,
				execution_id: executionId,
				status: 'timeout',
				error: error.message,
				message: 'Flow was triggered but completion polling failed or timed out',
			};
		}
	}
}
