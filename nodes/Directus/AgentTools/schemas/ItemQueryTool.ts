/**
 * Item Query Tool for AI Agents
 * Provides general-purpose item querying capabilities for any Directus collection
 */

import type { IExecuteFunctions } from 'n8n-workflow';
import { BaseAgentTool } from '../BaseAgentTool';
import type { IParameterSchema } from '../types';
import { directusApiRequest } from '../../GenericFunctions';

/**
 * Tool for querying items from Directus collections
 */
export class ItemQueryTool extends BaseAgentTool {
	readonly name = 'directus_query_items';
	readonly description = 'Query items from any Directus collection with flexible filtering, sorting, field selection, and pagination';
	readonly category = 'data_access';

	readonly parameters: Record<string, IParameterSchema> = {
		collection: {
			type: 'string',
			description: 'The name of the collection to query (e.g., "products", "articles", "users")',
			required: true,
		},
		filter: {
			type: 'object',
			description: 'Filter object using Directus filter syntax. Example: {"status": {"_eq": "published"}} or {"price": {"_gte": 100}}',
			required: false,
		},
		limit: {
			type: 'integer',
			description: 'Maximum number of items to return (default: 100, use -1 for all items)',
			required: false,
			default: 100,
		},
		offset: {
			type: 'integer',
			description: 'Number of items to skip (for pagination)',
			required: false,
			default: 0,
		},
		sort: {
			type: 'string',
			description: 'Field(s) to sort by. Use "-" prefix for descending (e.g., "-date_created" or "title,-id")',
			required: false,
		},
		fields: {
			type: 'string',
			description: 'Comma-separated list of fields to return (e.g., "id,title,status"). Use "*" for all fields',
			required: false,
			default: '*',
		},
		search: {
			type: 'string',
			description: 'Full-text search query across searchable fields',
			required: false,
		},
		deep: {
			type: 'object',
			description: 'Deep query for relational data. Example: {"related_items": {"_filter": {"status": {"_eq": "active"}}}}',
			required: false,
		},
		aggregate: {
			type: 'object',
			description: 'Aggregate operations. Example: {"count": "*"} or {"avg": "price"}',
			required: false,
		},
		groupBy: {
			type: 'string',
			description: 'Field(s) to group results by (comma-separated)',
			required: false,
		},
	};

	readonly examples = [
		'Get all published articles: collection="articles", filter={"status": {"_eq": "published"}}',
		'Search products by name: collection="products", search="laptop", limit=20',
		'Get users sorted by creation date: collection="directus_users", sort="-date_created", limit=50',
		'Query with relations: collection="posts", fields="id,title,author.first_name,author.last_name"',
		'Count items by status: collection="orders", aggregate={"count": "*"}, groupBy="status"',
	];

	private executionContext: IExecuteFunctions;

	constructor(executionContext: IExecuteFunctions) {
		super();
		this.executionContext = executionContext;
	}

	/**
	 * Execute item query
	 * @param params - Query parameters
	 * @returns Items matching the query with metadata
	 */
	protected async run(params: Record<string, any>): Promise<any> {
		const collection = params.collection;

		// Build query string
		const qs: Record<string, any> = {};

		// Add filter if provided
		if (params.filter && typeof params.filter === 'object') {
			qs.filter = JSON.stringify(params.filter);
		}

		// Add limit
		if (params.limit !== undefined) {
			qs.limit = params.limit;
		} else {
			qs.limit = 100; // Default limit
		}

		// Add offset for pagination
		if (params.offset !== undefined && params.offset > 0) {
			qs.offset = params.offset;
		}

		// Add sort
		if (params.sort) {
			qs.sort = params.sort;
		}

		// Add fields
		if (params.fields) {
			qs.fields = params.fields;
		} else {
			qs.fields = '*'; // Default to all fields
		}

		// Add search
		if (params.search) {
			qs.search = params.search;
		}

		// Add deep query for relational data
		if (params.deep && typeof params.deep === 'object') {
			qs.deep = JSON.stringify(params.deep);
		}

		// Add aggregation
		if (params.aggregate && typeof params.aggregate === 'object') {
			qs.aggregate = JSON.stringify(params.aggregate);
		}

		// Add groupBy
		if (params.groupBy) {
			qs.groupBy = params.groupBy;
		}

		// Add meta to get total count
		qs.meta = 'total_count,filter_count';

		// Query the collection
		const response = await directusApiRequest.call(
			this.executionContext,
			'GET',
			`items/${collection}`,
			{},
			qs,
		);

		// Extract data and metadata
		const items = response.data || response;
		const meta = response.meta || {};

		// Calculate result statistics
		const stats = {
			collection,
			items_returned: Array.isArray(items) ? items.length : (items ? 1 : 0),
			total_count: meta.total_count || meta.filter_count || null,
			filter_count: meta.filter_count || null,
			has_more: false,
		};

		// Determine if there are more items
		if (stats.total_count !== null && params.limit !== -1) {
			const currentOffset = params.offset || 0;
			const currentLimit = params.limit || 100;
			stats.has_more = (currentOffset + currentLimit) < stats.total_count;
		}

		// Build response
		const result: Record<string, any> = {
			items,
			statistics: stats,
			query_params: {
				collection: params.collection,
				filter: params.filter,
				limit: params.limit,
				offset: params.offset,
				sort: params.sort,
				fields: params.fields,
				search: params.search,
			},
		};

		// Add pagination info if applicable
		if (stats.has_more) {
			result.pagination = {
				next_offset: (params.offset || 0) + (params.limit || 100),
				has_more: true,
			};
		}

		// Add metadata if available
		if (Object.keys(meta).length > 0) {
			result.meta = meta;
		}

		return result;
	}
}
