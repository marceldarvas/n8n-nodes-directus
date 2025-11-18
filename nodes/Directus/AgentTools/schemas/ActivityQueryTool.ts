/**
 * Activity Query Tool for AI Agents
 * Provides activity log querying capabilities
 */

import type { IExecuteFunctions } from 'n8n-workflow';
import { BaseAgentTool } from '../BaseAgentTool';
import type { IParameterSchema } from '../types';
import { directusApiRequest } from '../../GenericFunctions';

/**
 * Tool for querying Directus activity logs
 */
export class ActivityQueryTool extends BaseAgentTool {
	readonly name = 'directus_query_activity';
	readonly description = 'Query Directus activity logs with filters for collection, user, action, and date range';
	readonly category = 'monitoring';

	readonly parameters: Record<string, IParameterSchema> = {
		collection: {
			type: 'string',
			description: 'Filter by collection name (e.g., "directus_users", "directus_flows")',
			required: false,
		},
		user_id: {
			type: 'string',
			description: 'Filter by user ID or UUID who performed the action',
			required: false,
		},
		action: {
			type: 'string',
			description: 'Filter by action type (create, update, delete, login, comment, run)',
			required: false,
			enum: ['create', 'update', 'delete', 'login', 'comment', 'run', 'upload'],
		},
		date_from: {
			type: 'string',
			description: 'Filter activities from this date (ISO 8601 format: YYYY-MM-DD or YYYY-MM-DDTHH:mm:ss)',
			required: false,
		},
		date_to: {
			type: 'string',
			description: 'Filter activities up to this date (ISO 8601 format: YYYY-MM-DD or YYYY-MM-DDTHH:mm:ss)',
			required: false,
		},
		limit: {
			type: 'integer',
			description: 'Maximum number of activity records to return (default: 100, max: 1000)',
			required: false,
			default: 100,
		},
		sort: {
			type: 'string',
			description: 'Sort order for results (e.g., "-timestamp" for descending, "timestamp" for ascending)',
			required: false,
			default: '-timestamp',
		},
		fields: {
			type: 'string',
			description: 'Comma-separated list of fields to return (e.g., "id,action,timestamp,user")',
			required: false,
		},
		item_id: {
			type: 'string',
			description: 'Filter by specific item ID that was acted upon',
			required: false,
		},
		ip_address: {
			type: 'string',
			description: 'Filter by IP address of the user who performed the action',
			required: false,
		},
	};

	readonly examples = [
		'Get activity logs for collection "products" from the last 7 days',
		'Query all login actions for user "abc-123"',
		'Find all delete actions between 2024-01-01 and 2024-01-31',
		'Get recent flow executions (action="run", collection="directus_flows")',
	];

	private executionContext: IExecuteFunctions;

	constructor(executionContext: IExecuteFunctions) {
		super();
		this.executionContext = executionContext;
	}

	/**
	 * Execute activity query
	 * @param params - Query parameters
	 * @returns Activity records matching the filters
	 */
	protected async run(params: Record<string, any>): Promise<any> {
		// Build filter conditions
		const filterConditions: any[] = [];

		// Add collection filter
		if (params.collection) {
			filterConditions.push({ collection: { _eq: params.collection } });
		}

		// Add user ID filter
		if (params.user_id) {
			filterConditions.push({ user: { _eq: params.user_id } });
		}

		// Add action filter
		if (params.action) {
			filterConditions.push({ action: { _eq: params.action } });
		}

		// Add date range filters
		if (params.date_from) {
			filterConditions.push({ timestamp: { _gte: params.date_from } });
		}

		if (params.date_to) {
			filterConditions.push({ timestamp: { _lte: params.date_to } });
		}

		// Add item ID filter
		if (params.item_id) {
			filterConditions.push({ item: { _eq: params.item_id } });
		}

		// Add IP address filter
		if (params.ip_address) {
			filterConditions.push({ ip: { _eq: params.ip_address } });
		}

		// Build query string
		const qs: Record<string, any> = {
			sort: params.sort || '-timestamp',
			limit: Math.min(params.limit || 100, 1000), // Cap at 1000
		};

		// Add filter if we have conditions
		if (filterConditions.length > 0) {
			qs.filter = JSON.stringify({ _and: filterConditions });
		}

		// Add fields if specified
		if (params.fields) {
			qs.fields = params.fields;
		}

		// Query the activity endpoint
		const response = await directusApiRequest.call(
			this.executionContext,
			'GET',
			'activity',
			{},
			qs,
		);

		const activities = response.data || response;

		// Calculate some basic statistics
		const stats = {
			total_records: Array.isArray(activities) ? activities.length : 0,
			actions: {} as Record<string, number>,
			users: new Set(),
			collections: new Set(),
			date_range: {
				earliest: null as string | null,
				latest: null as string | null,
			},
		};

		if (Array.isArray(activities)) {
			activities.forEach((activity: any) => {
				// Count actions
				const action = activity.action || 'unknown';
				stats.actions[action] = (stats.actions[action] || 0) + 1;

				// Track users
				if (activity.user) {
					stats.users.add(activity.user);
				}

				// Track collections
				if (activity.collection) {
					stats.collections.add(activity.collection);
				}

				// Track date range
				if (activity.timestamp) {
					if (!stats.date_range.earliest || activity.timestamp < stats.date_range.earliest) {
						stats.date_range.earliest = activity.timestamp;
					}
					if (!stats.date_range.latest || activity.timestamp > stats.date_range.latest) {
						stats.date_range.latest = activity.timestamp;
					}
				}
			});
		}

		return {
			activities,
			statistics: {
				total_records: stats.total_records,
				unique_users: stats.users.size,
				unique_collections: stats.collections.size,
				actions_breakdown: stats.actions,
				date_range: stats.date_range,
			},
			query_params: params,
		};
	}
}
