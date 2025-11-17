import { INodeProperties } from 'n8n-workflow';

export const flowOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['flow'],
			},
		},
		options: [
			{
				name: 'Create',
				value: 'create',
				description: 'Create a new flow with webhook trigger configuration',
				action: 'Create a flow',
			},
			{
				name: 'Delete',
				value: 'delete',
				description: 'Delete a flow',
				action: 'Delete a flow',
			},
			{
				name: 'Get',
				value: 'get',
				description: 'Get a flow by ID',
				action: 'Get a flow',
			},
			{
				name: 'List',
				value: 'list',
				description: 'List all flows',
				action: 'List flows',
			},
			{
				name: 'Trigger',
				value: 'trigger',
				description: 'Trigger a flow via webhook',
				action: 'Trigger a flow',
			},
			{
				name: 'Update',
				value: 'update',
				description: 'Update an existing flow',
				action: 'Update a flow',
			},
		],
		default: 'trigger',
	},
];

export const flowFields: INodeProperties[] = [
	// ----------------------------------
	//         Create operation fields
	// ----------------------------------
	{
		displayName: 'Name',
		name: 'name',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['flow'],
				operation: ['create'],
			},
		},
		default: '',
		placeholder: 'e.g., My Webhook Flow',
		description: 'The name of the flow',
	},
	{
		displayName: 'Trigger Type',
		name: 'triggerType',
		type: 'options',
		required: true,
		displayOptions: {
			show: {
				resource: ['flow'],
				operation: ['create'],
			},
		},
		options: [
			{
				name: 'Webhook',
				value: 'webhook',
				description: 'Trigger flow via webhook',
			},
			{
				name: 'Event',
				value: 'event',
				description: 'Trigger flow on database event',
			},
			{
				name: 'Schedule',
				value: 'schedule',
				description: 'Trigger flow on a schedule',
			},
			{
				name: 'Manual',
				value: 'manual',
				description: 'Trigger flow manually',
			},
		],
		default: 'webhook',
		description: 'The type of trigger for the flow',
	},
	{
		displayName: 'Webhook Method',
		name: 'webhookMethod',
		type: 'options',
		displayOptions: {
			show: {
				resource: ['flow'],
				operation: ['create'],
				triggerType: ['webhook'],
			},
		},
		options: [
			{
				name: 'GET',
				value: 'GET',
			},
			{
				name: 'POST',
				value: 'POST',
			},
			{
				name: 'PUT',
				value: 'PUT',
			},
			{
				name: 'DELETE',
				value: 'DELETE',
			},
		],
		default: 'POST',
		description: 'HTTP method for the webhook',
	},
	{
		displayName: 'Status',
		name: 'status',
		type: 'options',
		displayOptions: {
			show: {
				resource: ['flow'],
				operation: ['create'],
			},
		},
		options: [
			{
				name: 'Active',
				value: 'active',
				description: 'Flow is active and can be triggered',
			},
			{
				name: 'Inactive',
				value: 'inactive',
				description: 'Flow is inactive and cannot be triggered',
			},
		],
		default: 'active',
		description: 'The status of the flow',
	},
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['flow'],
				operation: ['create'],
			},
		},
		options: [
			{
				displayName: 'Description',
				name: 'description',
				type: 'string',
				default: '',
				description: 'Description of the flow',
			},
			{
				displayName: 'Icon',
				name: 'icon',
				type: 'string',
				default: '',
				placeholder: 'e.g., bolt',
				description: 'Icon for the flow',
			},
			{
				displayName: 'Color',
				name: 'color',
				type: 'string',
				default: '',
				placeholder: 'e.g., #6644FF',
				description: 'Color for the flow',
			},
			{
				displayName: 'Operations (JSON)',
				name: 'operations',
				type: 'json',
				default: '[]',
				description: 'Array of operations to execute in the flow',
				typeOptions: {
					alwaysOpenEditWindow: true,
				},
			},
			{
				displayName: 'Options (JSON)',
				name: 'options',
				type: 'json',
				default: '{}',
				description: 'Additional options for the flow trigger',
				typeOptions: {
					alwaysOpenEditWindow: true,
				},
			},
		],
	},
	// ----------------------------------
	//         Update operation fields
	// ----------------------------------
	{
		displayName: 'Flow ID',
		name: 'flowId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['flow'],
				operation: ['update'],
			},
		},
		default: '',
		placeholder: 'e.g., 8cbb43fe-4cdf-4991-8352-c461779cad5f',
		description: 'The ID of the flow to update',
	},
	{
		displayName: 'Update Fields',
		name: 'updateFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['flow'],
				operation: ['update'],
			},
		},
		options: [
			{
				displayName: 'Name',
				name: 'name',
				type: 'string',
				default: '',
				description: 'The name of the flow',
			},
			{
				displayName: 'Description',
				name: 'description',
				type: 'string',
				default: '',
				description: 'Description of the flow',
			},
			{
				displayName: 'Status',
				name: 'status',
				type: 'options',
				options: [
					{
						name: 'Active',
						value: 'active',
					},
					{
						name: 'Inactive',
						value: 'inactive',
					},
				],
				default: 'active',
				description: 'The status of the flow',
			},
			{
				displayName: 'Icon',
				name: 'icon',
				type: 'string',
				default: '',
				description: 'Icon for the flow',
			},
			{
				displayName: 'Color',
				name: 'color',
				type: 'string',
				default: '',
				description: 'Color for the flow',
			},
			{
				displayName: 'Operations (JSON)',
				name: 'operations',
				type: 'json',
				default: '[]',
				description: 'Array of operations to execute in the flow',
				typeOptions: {
					alwaysOpenEditWindow: true,
				},
			},
			{
				displayName: 'Options (JSON)',
				name: 'options',
				type: 'json',
				default: '{}',
				description: 'Additional options for the flow trigger',
				typeOptions: {
					alwaysOpenEditWindow: true,
				},
			},
		],
	},
	// ----------------------------------
	//         Delete operation fields
	// ----------------------------------
	{
		displayName: 'Flow ID',
		name: 'flowId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['flow'],
				operation: ['delete'],
			},
		},
		default: '',
		placeholder: 'e.g., 8cbb43fe-4cdf-4991-8352-c461779cad5f',
		description: 'The ID of the flow to delete',
	},
	// ----------------------------------
	//         Get/Trigger operation fields
	// ----------------------------------
	{
		displayName: 'Flow ID',
		name: 'flowId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['flow'],
				operation: ['trigger', 'get'],
			},
		},
		default: '',
		placeholder: 'e.g., 8cbb43fe-4cdf-4991-8352-c461779cad5f',
		description: 'The ID of the flow',
	},
	{
		displayName: 'Payload',
		name: 'payload',
		type: 'json',
		displayOptions: {
			show: {
				resource: ['flow'],
				operation: ['trigger'],
			},
		},
		default: '{}',
		description: 'JSON payload to pass to the flow',
	},
	{
		displayName: 'Execution Mode',
		name: 'executionMode',
		type: 'options',
		displayOptions: {
			show: {
				resource: ['flow'],
				operation: ['trigger'],
			},
		},
		options: [
			{
				name: 'Async',
				value: 'async',
				description: 'Trigger flow and return immediately',
			},
			{
				name: 'Sync',
				value: 'sync',
				description: 'Wait for flow to complete before returning',
			},
		],
		default: 'async',
		description: 'How to execute the flow',
	},
	{
		displayName: 'Max Wait Time (seconds)',
		name: 'maxWaitTime',
		type: 'number',
		displayOptions: {
			show: {
				resource: ['flow'],
				operation: ['trigger'],
				executionMode: ['sync'],
			},
		},
		default: 60,
		description: 'Maximum time to wait for flow completion in sync mode',
	},
	{
		displayName: 'Query Parameters',
		name: 'queryParameters',
		type: 'fixedCollection',
		typeOptions: {
			multipleValues: true,
		},
		displayOptions: {
			show: {
				resource: ['flow'],
				operation: ['trigger'],
			},
		},
		default: {},
		placeholder: 'Add Query Parameter',
		options: [
			{
				name: 'parameter',
				displayName: 'Parameter',
				values: [
					{
						displayName: 'Name',
						name: 'name',
						type: 'string',
						default: '',
						description: 'Parameter name',
					},
					{
						displayName: 'Value',
						name: 'value',
						type: 'string',
						default: '',
						description: 'Parameter value',
					},
				],
			},
		],
		description: 'Query parameters to pass to the flow webhook',
	},
	// List operation fields
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		displayOptions: {
			show: {
				resource: ['flow'],
				operation: ['list'],
			},
		},
		default: false,
		description: 'Whether to return all results or only up to a given limit',
	},
	{
		displayName: 'Limit',
		name: 'limit',
		type: 'number',
		displayOptions: {
			show: {
				resource: ['flow'],
				operation: ['list'],
				returnAll: [false],
			},
		},
		typeOptions: {
			minValue: 1,
			maxValue: 100,
		},
		default: 50,
		description: 'Max number of results to return',
	},
	{
		displayName: 'Options',
		name: 'options',
		type: 'collection',
		placeholder: 'Add Option',
		default: {},
		displayOptions: {
			show: {
				resource: ['flow'],
				operation: ['list'],
			},
		},
		options: [
			{
				displayName: 'Filter',
				name: 'filter',
				type: 'json',
				default: '{}',
				description: 'Filter query in JSON format',
			},
			{
				displayName: 'Sort',
				name: 'sort',
				type: 'string',
				default: '',
				description: 'Sort by field (prefix with - for descending)',
				placeholder: 'e.g., -date_created',
			},
			{
				displayName: 'Fields',
				name: 'fields',
				type: 'string',
				default: '',
				description: 'Comma-separated list of fields to return',
				placeholder: 'e.g., id,name,status',
			},
		],
	},
];
